/* Generated from scripts/. Edit the TypeScript source and run npm run build:js. */
"use strict";
(() => {
  // scripts/lib/dom.ts
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }
  function eventNode(event) {
    return event.target instanceof Node ? event.target : null;
  }

  // scripts/lib/search-index.ts
  function isRecord(value) {
    return typeof value === "object" && value !== null;
  }
  function asSearchDoc(value) {
    if (!isRecord(value)) {
      return null;
    }
    const doc = {};
    if (typeof value.title === "string") {
      doc.title = value.title;
    }
    if (typeof value.body === "string") {
      doc.body = value.body;
    }
    if (typeof value.summary === "string") {
      doc.summary = value.summary;
    }
    if (typeof value.description === "string") {
      doc.description = value.description;
    }
    if (typeof value.permalink === "string") {
      doc.permalink = value.permalink;
    }
    if (typeof value.url === "string") {
      doc.url = value.url;
    }
    return doc;
  }
  function docsFromIndex(data) {
    if (Array.isArray(data)) {
      return data.flatMap((item) => {
        const doc = asSearchDoc(item);
        return doc ? [doc] : [];
      });
    }
    if (!isRecord(data)) {
      return [];
    }
    const payload = data;
    if (Array.isArray(payload.docs)) {
      return payload.docs.flatMap((item) => {
        const doc = asSearchDoc(item);
        return doc ? [doc] : [];
      });
    }
    const stored = payload.documentStore?.docs;
    if (!stored || typeof stored !== "object") {
      return [];
    }
    return Object.keys(stored).map((key) => {
      const doc = stored[key];
      return {
        title: doc?.title || key,
        body: doc?.body || "",
        summary: doc?.summary || "",
        permalink: key,
        url: key
      };
    });
  }
  function normalizeTerm(term) {
    return term.toLowerCase().split(/\s+/).filter(Boolean);
  }
  function documentMatches(doc, terms) {
    if (!terms.length) {
      return false;
    }
    const haystack = `${doc.title || ""} ${doc.body || ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }
  function summaryOf(doc) {
    if (!doc) {
      return "";
    }
    const summary = doc.summary || doc.description || "";
    if (summary) {
      return summary;
    }
    if (!doc.body) {
      return "";
    }
    return doc.body.slice(0, 140) + (doc.body.length > 140 ? "\u2026" : "");
  }
  function resultHref(ref, baseHref) {
    if (ref.startsWith("/") || ref.startsWith("./") || ref.startsWith("../") || ref.startsWith("#")) {
      return ref;
    }
    try {
      const url = new URL(ref, baseHref);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.href;
      }
    } catch {
      return null;
    }
    return null;
  }

  // scripts/search.ts
  function debounce(func, wait) {
    let timeoutId = 0;
    return () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(func, wait);
    };
  }
  function renderResult(doc, ref) {
    const href = resultHref(ref, window.location.href);
    if (!href) {
      return null;
    }
    const title = doc.title || ref;
    const article = document.createElement("article");
    article.className = "post-entry";
    const header = document.createElement("header");
    header.className = "entry-header";
    const heading = document.createElement("h3");
    heading.append(document.createTextNode(title), document.createTextNode("\xA0\xBB"));
    header.append(heading);
    article.append(header);
    const summary = summaryOf(doc);
    if (summary) {
      const content = document.createElement("div");
      content.className = "entry-content";
      const paragraph = document.createElement("p");
      paragraph.textContent = summary;
      content.append(paragraph);
      article.append(content);
    }
    const link = document.createElement("a");
    link.className = "entry-link";
    link.href = href;
    link.setAttribute("aria-label", title);
    article.append(link);
    return article;
  }
  function initSearch() {
    const searchIndexJsonUrl = document.body.dataset.searchIndexJsonUrl;
    const searchIndexJsUrl = document.body.dataset.searchIndexJsUrl;
    const input = document.getElementById("searchInput");
    const resultsList = document.getElementById("searchResults");
    if (!(input instanceof HTMLInputElement) || !resultsList || !searchIndexJsonUrl || !searchIndexJsUrl) {
      return;
    }
    const maxItems = 10;
    let currentTerm = "";
    let indexPromise = null;
    function initIndex() {
      if (!indexPromise) {
        indexPromise = loadIndex();
      }
      return indexPromise;
    }
    async function loadIndex() {
      try {
        const jsonResponse = await fetch(searchIndexJsonUrl ?? "");
        if (jsonResponse.ok && jsonResponse.headers.get("content-type")?.includes("application/json")) {
          const docs = docsFromIndex(await jsonResponse.json());
          if (docs.length) {
            return docs;
          }
        }
      } catch {
      }
      try {
        const jsResponse = await fetch(searchIndexJsUrl ?? "");
        const text = await jsResponse.text();
        const prefix = "window.searchIndex = ";
        if (text.startsWith(prefix)) {
          return docsFromIndex(JSON.parse(text.slice(prefix.length)));
        }
      } catch (err) {
        console.error("Failed to load search index", err);
      }
      return [];
    }
    function clearResults() {
      resultsList?.replaceChildren();
      if (resultsList) {
        resultsList.style.display = "none";
      }
    }
    async function performSearch(term) {
      if (!resultsList) {
        return;
      }
      if (!term) {
        clearResults();
        return;
      }
      const docs = await initIndex();
      const terms = normalizeTerm(term);
      const results = [];
      for (const doc of docs) {
        if (!documentMatches(doc, terms)) {
          continue;
        }
        const ref = doc.permalink || doc.url;
        if (!ref) {
          continue;
        }
        const card = renderResult(doc, ref);
        if (card) {
          results.push(card);
        }
        if (results.length >= maxItems) {
          break;
        }
      }
      if (!results.length) {
        clearResults();
        return;
      }
      resultsList.style.display = "block";
      resultsList.replaceChildren(...results);
    }
    const debounced = debounce(() => {
      const term = input.value.trim();
      if (term === currentTerm) {
        return;
      }
      currentTerm = term;
      void performSearch(term);
    }, 150);
    input.addEventListener("input", debounced);
    window.addEventListener("click", (event) => {
      const target = eventNode(event);
      if (resultsList.style.display === "block" && target !== null && !resultsList.contains(target) && target !== input) {
        resultsList.style.display = "none";
      }
    });
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) {
      input.value = initial;
      currentTerm = "";
      void performSearch(initial);
    }
  }
  onReady(initSearch);
})();
