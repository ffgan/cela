import { normalizeScheme, type Scheme } from "../lib/scheme";

function rememberChoice(): boolean {
  return document.documentElement.dataset.rememberChoice === "true";
}

function configuredDefault(): Scheme | null {
  const value = document.documentElement.dataset.defaultTheme ?? "";
  if (value === "dark" || value === "light") {
    return value;
  }
  return null;
}

function resolveScheme(): Scheme {
  if (rememberChoice()) {
    try {
      const stored = normalizeScheme(localStorage.getItem("pref-scheme"));
      if (stored) {
        return stored;
      }
    } catch {
      // Private mode can reject localStorage.
    }
  }

  const fallback = configuredDefault();
  if (fallback) {
    return fallback;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyEarlyTheme(): void {
  const scheme = resolveScheme();
  const root = document.documentElement;
  root.classList.add("js");
  root.setAttribute("data-scheme", scheme);
  root.classList.toggle("dark", scheme === "dark");
  document.body?.classList.toggle("dark", scheme === "dark");

  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute("content", scheme);
  }

  if (rememberChoice()) {
    try {
      localStorage.setItem("pref-scheme", scheme);
    } catch {
      // Ignore storage failures.
    }
  }
}

applyEarlyTheme();
