import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeUtf8Base64, encodeUtf8Base64 } from "./base64";

test("round-trips unicode text through base64", () => {
  const text = "你好，Cela — café";
  assert.equal(decodeUtf8Base64(encodeUtf8Base64(text)), text);
});

test("matches the utf-8 base64 of a known string", () => {
  assert.equal(encodeUtf8Base64("你好"), "5L2g5aW9");
});
