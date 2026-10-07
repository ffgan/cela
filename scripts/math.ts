interface RenderMathOptions {
  delimiters: Array<{ left: string; right: string; display: boolean }>;
  throwOnError: boolean;
}

declare global {
  interface Window {
    renderMathInElement?: (element: Element, options: RenderMathOptions) => void;
  }
}

export {};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function boot(): void {
  const loader = document.querySelector("script[data-katex-js]");
  if (!(loader instanceof HTMLScriptElement)) {
    return;
  }
  const katexJs = loader.dataset.katexJs;
  const autoJs = loader.dataset.katexAuto;
  if (!katexJs || !autoJs) {
    return;
  }

  const css = document.getElementById("katex-css");
  if (css instanceof HTMLLinkElement) {
    css.media = "all";
  }

  loadScript(katexJs)
    .then(() => loadScript(autoJs))
    .then(() => {
      const root = document.querySelector(".post-content.mathjax");
      const render = window.renderMathInElement;
      if (!root || typeof render !== "function") {
        return;
      }
      render(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
      });
    })
    .catch((error: unknown) => {
      console.error("Failed to load KaTeX", error);
    });
}

const requestIdle = window.requestIdleCallback;
if (requestIdle) {
  requestIdle(() => boot(), { timeout: 1500 });
} else if (document.readyState === "complete") {
  window.setTimeout(boot, 1);
} else {
  window.addEventListener("load", boot);
}
