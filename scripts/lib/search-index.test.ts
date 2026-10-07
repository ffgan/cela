import assert from "node:assert/strict";
import { test } from "node:test";
import {
  docsFromIndex,
  documentMatches,
  normalizeTerm,
  resultHref,
  summaryOf,
} from "./search-index";

test("matches Chinese queries as substrings", () => {
  const terms = normalizeTerm("分页 首页");
  assert.equal(
    documentMatches({ title: "修好首页分页", body: "说明" }, terms),
    true,
  );
  assert.equal(documentMatches({ title: "Hello", body: "world" }, terms), false);
});

test("reads an elasticlunr document store", () => {
  const docs = docsFromIndex({
    documentStore: {
      docs: {
        "/blog/a/": { title: "Alpha", body: "body text", summary: "sum" },
      },
    },
  });
  assert.equal(docs.length, 1);
  assert.equal(docs[0]?.permalink, "/blog/a/");
  assert.equal(docs[0]?.title, "Alpha");
  assert.equal(summaryOf(docs[0]), "sum");
});

test("reads a plain document array and truncates a long body", () => {
  const body = "x".repeat(141);
  const docs = docsFromIndex([{ title: "Only", body }]);
  assert.equal(summaryOf(docs[0]), `${"x".repeat(140)}…`);
});

test("accepts site permalinks and rejects other protocols", () => {
  assert.equal(resultHref("/blog/post/", "https://blog.ffgan.com/"), "/blog/post/");
  assert.equal(
    resultHref("https://blog.ffgan.com/blog/post/", "https://blog.ffgan.com/"),
    "https://blog.ffgan.com/blog/post/",
  );
  assert.equal(resultHref("javascript:alert(1)", "https://blog.ffgan.com/"), null);
});
