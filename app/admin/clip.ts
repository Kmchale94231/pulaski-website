export const CLIP_SECONDS = 30;

// Byte range of a CLIP_SECONDS clip inside an MP3, skipping the ID3 tag at the front.
// shortcut: assumes a steady bitrate, so variable-bitrate files can come out a few seconds off; switch to ffmpeg.wasm if clips sound wrong.
export function clipRange(size: number, tagBytes: number, duration: number, start: number) {
  const bytesPerSecond = (size - tagBytes) / duration;
  const from = Math.max(0, Math.min(start, duration - CLIP_SECONDS));
  return [
    Math.floor(tagBytes + from * bytesPerSecond),
    Math.min(size, Math.floor(tagBytes + (from + CLIP_SECONDS) * bytesPerSecond)),
  ];
}

// Size of an ID3v2 tag (title, embedded artwork…) at the start of an MP3, or 0 if there is none.
export function id3Size(head: Uint8Array) {
  if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return 0; // "ID3"
  return 10 + ((head[6] << 21) | (head[7] << 14) | (head[8] << 7) | head[9]);
}
