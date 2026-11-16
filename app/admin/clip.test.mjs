import assert from "node:assert/strict";
import test from "node:test";
import { clipRange, id3Size } from "./clip.ts";

test("clip skips the ID3 tag and takes 30s of audio", () => {
  // 100 bytes of tag, then 1000 bytes/second for 120 seconds
  assert.deepEqual(clipRange(100 + 120_000, 100, 120, 10), [10_100, 40_100]);
});

test("start near the end is pulled back so the clip stays 30s", () => {
  assert.deepEqual(clipRange(120_000, 0, 120, 110), [90_000, 120_000]);
});

test("track shorter than 30s gives the whole track", () => {
  assert.deepEqual(clipRange(20_000, 0, 20, 5), [0, 20_000]);
});

test("ID3 size is read from the header", () => {
  assert.equal(id3Size(new Uint8Array([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 1, 0])), 10 + 128);
  assert.equal(id3Size(new Uint8Array([0xff, 0xfb, 0, 0, 0, 0, 0, 0, 0, 0])), 0);
});
