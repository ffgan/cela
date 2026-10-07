import { onReady } from "./lib/dom";
import { normalizeScheme, type Scheme } from "./lib/scheme";

function initMenuScrollPersistence(): void {
  const menu = document.getElementById("menu");
  if (!menu) {
    return;
  }

  menu.scrollLeft = Number(localStorage.getItem("menu-scroll-position") || 0);
  menu.addEventListener("scroll", () => {
    localStorage.setItem("menu-scroll-position", String(menu.scrollLeft));
  });
}

function initNavDrawer(): void {
  const drawer = document.getElementById("nav-drawer");
  const toggle = document.getElementById("nav-drawer-toggle");
  const sheet = document.getElementById("nav-drawer-sheet");
  if (!drawer || !toggle || !sheet) {
    return;
  }

  const mq = window.matchMedia("(max-width: 768px)");
  let lastFocused: HTMLElement | null = null;

  function isMobile(): boolean {
    return mq.matches;
  }

  function setToggleState(open: boolean): void {
    toggle?.setAttribute("aria-expanded", open ? "true" : "false");
    toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function setDialogAttrs(open: boolean): void {
    if (!sheet) {
      return;
    }
    if (open) {
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-modal", "true");
      sheet.setAttribute("aria-label", "Site navigation");
      return;
    }
    sheet.removeAttribute("role");
    sheet.removeAttribute("aria-modal");
    sheet.removeAttribute("aria-label");
  }

  function openDrawer(): void {
    if (!drawer || !isMobile() || drawer.classList.contains("is-open")) {
      return;
    }
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.hidden = false;
    // Force reflow so the open transition runs after un-hiding.
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    document.body.classList.add("nav-drawer-open");
    setToggleState(true);
    setDialogAttrs(true);
    const closeBtn = drawer.querySelector<HTMLElement>("[data-nav-drawer-close].md-icon-button");
    closeBtn?.focus();
  }

  function closeDrawer(): void {
    if (!drawer || !toggle || (!drawer.classList.contains("is-open") && drawer.hidden)) {
      return;
    }
    drawer.classList.remove("is-open");
    document.body.classList.remove("nav-drawer-open");
    setToggleState(false);
    setDialogAttrs(false);

    function finalizeHide(): void {
      if (drawer && !drawer.classList.contains("is-open")) {
        drawer.hidden = true;
      }
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      finalizeHide();
    } else {
      window.setTimeout(finalizeHide, 320);
    }

    if (lastFocused) {
      lastFocused.focus();
    } else {
      toggle.focus();
    }
  }

  function toggleDrawer(): void {
    if (drawer?.classList.contains("is-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDrawer();
  });

  drawer.querySelectorAll("[data-nav-drawer-close]").forEach((el) => {
    el.addEventListener("click", closeDrawer);
  });

  drawer.querySelectorAll(".md-nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) {
        closeDrawer();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  function onViewportChange(): void {
    if (!isMobile()) {
      closeDrawer();
    }
  }

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onViewportChange);
  } else {
    const legacy = mq as MediaQueryList & {
      addListener?: (listener: () => void) => void;
    };
    legacy.addListener?.(onViewportChange);
  }
}

function initSmoothAnchors(): void {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const href = anchor.getAttribute("href");
      const id = href ? href.slice(1) : "";
      const target = id ? document.querySelector(`[id='${decodeURIComponent(id)}']`) : null;
      if (!target) {
        return;
      }

      event.preventDefault();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

      if (id === "top") {
        history.replaceState(null, "", " ");
      } else {
        history.pushState(null, "", `#${id}`);
      }
    });
  });
}

function syncThemeColor(): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    return;
  }
  const surface = getComputedStyle(document.documentElement).getPropertyValue("--md-surface").trim();
  if (surface) {
    meta.setAttribute("content", surface);
  }
}

function initAppBarScroll(): void {
  const header = document.querySelector(".header");
  if (!header) {
    return;
  }

  function syncScrolled(): void {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  syncScrolled();
  window.addEventListener("scroll", syncScrolled, { passive: true });
}

function initTopLink(): void {
  const topLink = document.getElementById("top-link");
  if (!topLink) {
    return;
  }

  function syncTopLink(): void {
    const shouldShow = document.body.scrollTop > 800 || document.documentElement.scrollTop > 800;
    topLink?.classList.toggle("is-visible", shouldShow);
  }

  syncTopLink();
  window.addEventListener("scroll", syncTopLink, { passive: true });
}

function initThemeToggle(): void {
  if (document.body.dataset.showThemeToggle !== "true") {
    return;
  }
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const current = normalizeScheme(document.documentElement.getAttribute("data-scheme")) || "light";
    const next: Scheme = current === "light" ? "dark" : "light";
    applyScheme(next);
  });
}

function ancestor(node: Node, depth: number): Node | null {
  let current: Node | null = node;
  for (let step = 0; step < depth; step += 1) {
    current = current?.parentNode ?? null;
  }
  return current;
}

function initCodeCopyButtons(): void {
  if (document.body.dataset.showCodeCopyButtons !== "true") {
    return;
  }

  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    const container = pre?.parentElement ?? null;
    if (!pre || !container) {
      return;
    }

    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-code");
    copyButton.type = "button";
    copyButton.textContent = "copy";

    function copyingDone(): void {
      copyButton.textContent = "copied!";
      window.setTimeout(() => {
        copyButton.textContent = "copy";
      }, 2000);
    }

    copyButton.addEventListener("click", () => {
      let content = codeBlock.textContent ?? "";
      const first = codeBlock.firstElementChild;
      if (first instanceof HTMLTableElement) {
        content = Array.from(first.getElementsByTagName("span"))
          .map((span) => span.textContent ?? "")
          .join("");
      }

      if ("clipboard" in navigator) {
        void navigator.clipboard.writeText(content);
        copyingDone();
        return;
      }

      const range = document.createRange();
      range.selectNodeContents(codeBlock);
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
        copyingDone();
      } catch {
        // Ignore browsers that reject the legacy copy path.
      }
      selection.removeRange(range);
    });

    const table = ancestor(codeBlock, 5);
    if (container.classList.contains("highlight")) {
      container.appendChild(copyButton);
    } else if (container.parentNode?.firstChild === container) {
      return;
    } else if (table?.nodeName === "TABLE") {
      table.appendChild(copyButton);
    } else {
      pre.appendChild(copyButton);
    }
  });
}

function applyScheme(scheme: string): void {
  const normalized = normalizeScheme(scheme) || "light";
  document.documentElement.setAttribute("data-scheme", normalized);
  const isDark = normalized === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark", isDark);
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute("content", normalized);
  }
  if (document.body.dataset.rememberChoice === "true") {
    localStorage.setItem("pref-scheme", normalized);
  }
  syncThemeColor();
}

function initDebugConsole(): void {
  if (document.documentElement.dataset.debug !== "true") {
    return;
  }
  console.log("Local Storage:");
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key) {
      console.log(key, localStorage.getItem(key));
    }
  }
}

onReady(() => {
  initDebugConsole();
  initMenuScrollPersistence();
  initNavDrawer();
  initSmoothAnchors();
  initAppBarScroll();
  initTopLink();
  initThemeToggle();
  initCodeCopyButtons();
  syncThemeColor();
});
