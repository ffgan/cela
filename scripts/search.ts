import { eventNode, onReady } from "./lib/dom";
import {
  docsFromIndex,
  documentMatches,
  normalizeTerm,
  resultHref,
  summaryOf,
  type SearchDoc,
} from "./lib/search-index";

function debounce(func: () => void, wait: number): () => void {
  let timeoutId = 0;
  return () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(func, wait);
  };
}

function renderResult(doc: SearchDoc, ref: string): HTMLElement | null {
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
  heading.append(document.createTextNode(title), document.createTextNode("\u00a0»"));
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

function initSearch(): void {
  const searchIndexJsonUrl = document.body.dataset.searchIndexJsonUrl;
  const searchIndexJsUrl = document.body.dataset.searchIndexJsUrl;
  const input = document.getElementById("searchInput");
  const resultsList = document.getElementById("searchResults");
  if (
    !(input instanceof HTMLInputElement) ||
    !resultsList ||
    !searchIndexJsonUrl ||
    !searchIndexJsUrl
  ) {
    return;
  }

  const maxItems = 10;
  let currentTerm = "";
  let indexPromise: Promise<SearchDoc[]> | null = null;

  function initIndex(): Promise<SearchDoc[]> {
    if (!indexPromise) {
      indexPromise = loadIndex();
    }
    return indexPromise;
  }

  async function loadIndex(): Promise<SearchDoc[]> {
    try {
      const jsonResponse = await fetch(searchIndexJsonUrl ?? "");
      if (
        jsonResponse.ok &&
        jsonResponse.headers.get("content-type")?.includes("application/json")
      ) {
        const docs = docsFromIndex(await jsonResponse.json());
        if (docs.length) {
          return docs;
        }
      }
    } catch {
      // Fall back to the JS index format below.
    }

    try {
      const jsResponse = await fetch(searchIndexJsUrl ?? "");
      const text = await jsResponse.text();
      const prefix = "window.searchIndex = ";
      if (text.startsWith(prefix)) {
        return docsFromIndex(JSON.parse(text.slice(prefix.length)) as unknown);
      }
    } catch (err) {
      console.error("Failed to load search index", err);
    }
    return [];
  }

  function clearResults(): void {
    resultsList?.replaceChildren();
    if (resultsList) {
      resultsList.style.display = "none";
    }
  }

  async function performSearch(term: string): Promise<void> {
    if (!resultsList) {
      return;
    }
    if (!term) {
      clearResults();
      return;
    }
    const docs = await initIndex();
    const terms = normalizeTerm(term);
    const results: HTMLElement[] = [];

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
    if (
      resultsList.style.display === "block" &&
      target !== null &&
      !resultsList.contains(target) &&
      target !== input
    ) {
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
