"use client";

import { type SubmitEvent, useRef, useState, useTransition } from "react";
import { saveBeat } from "./actions";
import { CLIP_SECONDS, clipRange, id3Size } from "./clip";

const input = "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";
const label = "flex flex-col gap-1 text-sm";

export default function NewBeatForm() {
  const [track, setTrack] = useState<{ file: File; url: string } | null>(null);
  const [start, setStart] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const trackAudio = useRef<HTMLAudioElement>(null);

  async function cutClip() {
    const audio = trackAudio.current!;
    const file = track!.file;
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer());
    const [from, to] = clipRange(file.size, id3Size(head), audio.duration, start);
    return file.slice(from, to, "audio/mpeg");
  }

  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // onSubmit rather than a form action, so a failed save keeps everything typed in.
  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    startTransition(async () => {
      if (!track || !trackAudio.current?.duration) return setMessage("Pick the tagged MP3 first.");
      form.set("preview", await cutClip(), "preview.mp3");
      const error = await saveBeat(form);
      if (error) return setMessage(error);
      formEl.reset();
      setTrack(null);
      setClipUrl(null);
      setStart(0);
      setMessage("Saved.");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className={label}>
        Title
        <input name="title" required className={input} />
      </label>
      <div className="flex gap-4">
        <label className={label}>
          BPM
          <input name="bpm" type="number" min="1" max="300" className={input} />
        </label>
        <label className={label}>
          Key
          <input name="musical_key" placeholder="e.g. C# minor" className={input} />
        </label>
      </div>
      <label className={label}>
        Cover image (optional, under 2 MB)
        <input name="cover" type="file" accept="image/*" className={input} />
      </label>

      <fieldset className="flex flex-col gap-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm">Preview ({CLIP_SECONDS}s, cut from the tagged MP3)</legend>
        {/* No name: the full track stays in the browser; only the cut clip is uploaded. */}
        <input
          type="file"
          accept="audio/mpeg"
          className={input}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setTrack(file ? { file, url: URL.createObjectURL(file) } : null);
            setClipUrl(null);
          }}
        />
        {track && (
          <>
            <audio ref={trackAudio} src={track.url} controls className="w-full" />
            <div className="flex flex-wrap items-end gap-3">
              <label className={label}>
                Start at (seconds)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className={input}
                />
              </label>
              <button
                type="button"
                onClick={() => setStart(Math.round(trackAudio.current!.currentTime * 10) / 10)}
                className="rounded border px-3 py-2 text-sm"
              >
                Use current position
              </button>
              <button
                type="button"
                onClick={async () => setClipUrl(URL.createObjectURL(await cutClip()))}
                className="rounded border px-3 py-2 text-sm"
              >
                Listen to clip
              </button>
            </div>
            {clipUrl && <audio src={clipUrl} controls autoPlay className="w-full" />}
          </>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm">Google Drive links (sent to buyers)</legend>
        <label className={label}>
          MP3
          <input name="mp3_url" type="url" required className={input} />
        </label>
        <label className={label}>
          WAV
          <input name="wav_url" type="url" required className={input} />
        </label>
        <label className={label}>
          Stems
          <input name="stems_url" type="url" required className={input} />
        </label>
      </fieldset>

      <button disabled={pending} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
        {pending ? "Saving…" : "Save beat"}
      </button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  );
}
