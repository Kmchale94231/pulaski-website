import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import BeatList, { type Beat } from "./beat-list";

async function getBeats() {
  "use cache";
  cacheLife("hours");
  cacheTag("beats"); // admin edits will refresh this tag
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const { data, error } = await supabase
    .from("beats")
    .select("id, title, bpm, musical_key, cover_url, preview_url")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Beat[];
}

export default async function Home() {
  const beats = await getBeats();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-32">
      <h1 className="mb-6 text-3xl font-bold">Beats</h1>
      <BeatList beats={beats} />
    </main>
  );
}
