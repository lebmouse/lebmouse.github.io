import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { publish, decode } from "../src/admin/github.ts";
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
test("publishes a UTF-8 post and image in one commit", async () => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method ?? "GET",
      body: init.body && JSON.parse(init.body),
    });
    if (url.endsWith("/git/ref/heads/main"))
      return response({ object: { sha: "head" } });
    if (url.endsWith("/git/commits/head"))
      return response({ tree: { sha: "base" } });
    if (url.includes("/contents/"))
      return response({ message: "Not Found" }, 404);
    if (url.endsWith("/git/blobs"))
      return response({ sha: `blob${calls.length}` });
    if (url.endsWith("/git/trees")) return response({ sha: "tree" });
    if (url.endsWith("/git/commits")) return response({ sha: "new-head" });
    if (url.endsWith("/git/refs/heads/main"))
      return response({ object: { sha: "new-head" } });
    throw new Error(String(url));
  };
  const sha = await publish("test-token", "sample", "안녕하세요", null, [
    new File(["img"], "image.png", { type: "image/png" }),
  ]);
  assert.equal(sha, "new-head");
  assert.equal(
    decode(calls.find((c) => c.url.endsWith("/git/blobs")).body.content),
    "안녕하세요",
  );
  assert.deepEqual(
    calls
      .find((c) => c.url.endsWith("/git/trees"))
      .body.tree.map((e) => e.path),
    ["src/_posts/sample.mdx", "public/images/posts/sample/image.png"],
  );
  assert.deepEqual(calls.at(-1).body, { sha: "new-head", force: false });
});
test("does not commit if the post changed elsewhere", async () => {
  const paths = [];
  globalThis.fetch = async (url) => {
    paths.push(String(url));
    if (url.endsWith("/git/ref/heads/main"))
      return response({ object: { sha: "head" } });
    if (url.endsWith("/git/commits/head"))
      return response({ tree: { sha: "base" } });
    return response({ sha: "changed" });
  };
  await assert.rejects(
    publish("token", "sample", "text", "original", []),
    /다른 곳에서/,
  );
  assert.equal(
    paths.some((p) => p.endsWith("/git/blobs")),
    false,
  );
});
