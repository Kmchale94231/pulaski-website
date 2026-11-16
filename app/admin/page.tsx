import { Suspense } from "react";
import { adminDb, requireAdmin } from "@/lib/supabase";
import { deleteBeat, signOut } from "./actions";
import ConfirmButton from "./confirm-button";
import NewBeatForm from "./new-beat-form";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Admin />
      </Suspense>
    </main>
  );
}

async function Admin() {
  await requireAdmin();
  const { data: beats, error } = await adminDb()
    .from("beats")
    .select("id, title, sold")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <form action={signOut}>
          <button className="text-sm underline">Log out</button>
        </form>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Add a beat</h2>
      <NewBeatForm />

      <h2 className="mt-10 mb-3 text-lg font-semibold">Beats</h2>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {beats.map((beat) => (
          <li key={beat.id} className="flex items-center justify-between gap-4 py-2">
            <span>
              {beat.title}
              {beat.sold && <span className="ml-2 text-sm text-zinc-500">(sold)</span>}
            </span>
            <form action={deleteBeat}>
              <input type="hidden" name="id" value={beat.id} />
              <ConfirmButton message={`Delete "${beat.title}" and its preview? This can't be undone.`}>
                Delete
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
