export interface SearchDoc {
  title?: string;
  body?: string;
  summary?: string;
  description?: string;
  permalink?: string;
  url?: string;
}

interface StoredDoc {
  title?: string;
  body?: string;
  summary?: string;
}

interface SearchIndexPayload {
  docs?: unknown;
  documentStore?: {
    docs?: Record<string, StoredDoc | undefined>;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asSearchDoc(value: unknown): SearchDoc | null {
  if (!isRecord(value)) {
    return null;
  }
  const doc: SearchDoc = {};
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

export function docsFromIndex(data: unknown): SearchDoc[] {
  if (Array.isArray(data)) {
    return data.flatMap((item) => {
      const doc = asSearchDoc(item);
      return doc ? [doc] : [];
    });
  }
  if (!isRecord(data)) {
    return [];
  }

  const payload = data as SearchIndexPayload;
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
      url: key,
    };
  });
}

export function normalizeTerm(term: string): string[] {
  return term.toLowerCase().split(/\s+/).filter(Boolean);
}

export function documentMatches(doc: SearchDoc, terms: readonly string[]): boolean {
  if (!terms.length) {
    return false;
  }

  // Substring match on the stored title and body. elasticlunr has no Chinese
  // tokenizer, so the inverted index is not used for the query itself.
  const haystack = `${doc.title || ""} ${doc.body || ""}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function summaryOf(doc: SearchDoc | undefined): string {
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
  return doc.body.slice(0, 140) + (doc.body.length > 140 ? "…" : "");
}

export function resultHref(ref: string, baseHref: string): string | null {
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
