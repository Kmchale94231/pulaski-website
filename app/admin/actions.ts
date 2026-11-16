"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb, authClient, requireAdmin } from "@/lib/supabase";

const MAX_UPLOAD = 2 * 1024 * 1024; // each file; both together must stay under Vercel's 4.5 MB request limit

export async function signIn(_prev: string | null, form: FormData) {
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error || data.user.email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    return "Wrong email or password.";
  }
  redirect("/admin");
}

export async function signOut() {
  await (await authClient()).auth.signOut();
  redirect("/admin/login");
}

export async function saveBeat(form: FormData): Promise<string | null> {
  await requireAdmin();

  const title = String(form.get("title") ?? "").trim();
  const bpm = Number(form.get("bpm")) || null;
  const musical_key = String(form.get("musical_key") ?? "").trim() || null;
  const preview = form.get("preview");
  const cover = form.get("cover");
  const [mp3_url, wav_url, stems_url] = ["mp3_url", "wav_url", "stems_url"].map((k) =>
    String(form.get(k) ?? "").trim(),
  );
  const hasCover = cover instanceof File && cover.size > 0;

  if (!title) return "Title is required.";
  if (!(preview instanceof File) || preview.type !== "audio/mpeg" || !preview.size || preview.size > MAX_UPLOAD)
    return "Preview clip is missing or too large.";
  if (hasCover && (!cover.type.startsWith("image/") || cover.size > MAX_UPLOAD))
    return "Cover must be an image under 2 MB.";
  if (![mp3_url, wav_url, stems_url].every((l) => l.startsWith("https://")))
    return "All three Drive links must start with https://";

  const db = adminDb();
  const storage = db.storage.from("media");
  const id = crypto.randomUUID();
  const publicUrl = (path: string) => storage.getPublicUrl(path).data.publicUrl;

  const clip = await storage.upload(`${id}/preview.mp3`, preview, { contentType: "audio/mpeg" });
  if (clip.error) return clip.error.message;
  if (hasCover) {
    const img = await storage.upload(`${id}/cover`, cover, { contentType: cover.type });
    if (img.error) return (await removeFiles(id), img.error.message);
  }

  const beat = await db.from("beats").insert({
    id,
    title,
    bpm,
    musical_key,
    cover_url: hasCover ? publicUrl(`${id}/cover`) : null,
    preview_url: publicUrl(`${id}/preview.mp3`),
  });
  if (beat.error) return (await removeFiles(id), beat.error.message);

  const files = await db.from("beat_files").insert({ beat_id: id, mp3_url, wav_url, stems_url });
  if (files.error) {
    await db.from("beats").delete().eq("id", id);
    return (await removeFiles(id), files.error.message);
  }

  updateTag("beats");
  return null;
}

export async function deleteBeat(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const { error } = await adminDb().from("beats").delete().eq("id", id); // beat_files row goes with it
  if (error) throw error;
  await removeFiles(id);
  updateTag("beats");
}

async function removeFiles(id: string) {
  const storage = adminDb().storage.from("media");
  const { data } = await storage.list(id);
  if (data?.length) await storage.remove(data.map((f) => `${id}/${f.name}`));
}
