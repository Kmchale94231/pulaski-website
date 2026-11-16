"use client";

import { useState } from "react";

export type Beat = {
  id: string;
  title: string;
  bpm: number | null;
  musical_key: string | null;
  cover_url: string | null;
  preview_url: string;
};

export default function BeatList({ beats }: { beats: Beat[] }) {
  const [playing, setPlaying] = useState<Beat | null>(null);

  if (!beats.length) return <p className="text-zinc-500">No beats yet.</p>;

  return (
    <>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {beats.map((beat) => (
          <li key={beat.id} className="flex items-center gap-4 py-3">
            <button
              onClick={() => setPlaying(beat)}
              aria-label={`Play ${beat.title}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
            >
              ▶
            </button>
            {beat.cover_url && (
              // Plain img: Next's image optimizer would count against Vercel's free quota.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beat.cover_url} alt="" className="size-12 rounded object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{beat.title}</p>
              <p className="text-sm text-zinc-500">
                {[beat.bpm && `${beat.bpm} BPM`, beat.musical_key].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {playing && (
        <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-background p-3 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl">
            <p className="mb-1 truncate text-sm font-medium">{playing.title}</p>
            <audio key={playing.id} src={playing.preview_url} controls autoPlay className="w-full" />
          </div>
        </div>
      )}
    </>
  );
}
