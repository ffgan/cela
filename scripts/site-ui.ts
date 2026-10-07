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

const copyIcon =
  '<svg class="md-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true"><path d="M300-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440v-560H300v560ZM180-80q-24 0-42-18t-18-42v-590q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v590h470q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32Q662.75-80 650-80H180Zm120-180v-560 560Z"/></svg>';
const copiedIcon =
  '<svg class="md-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true"><path d="m378-332 363-363q9-9 21.5-9t21.5 9q9 9 9 21.5t-9 21.5L399-267q-9 9-21 9t-21-9L175-449q-9-9-8.5-21.5T176-492q9-9 21.5-9t21.5 9l159 160Z"/></svg>';

function initCodeCopyButtons(): void {
  if (document.body.dataset.showCodeCopyButtons !== "true") {
    return;
  }

  const zh = document.documentElement.lang.toLowerCase().startsWith("zh");
  const labelCopy = zh ? "复制代码" : "Copy code";
  const labelCopied = zh ? "已复制" : "Copied";

  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    const container = pre?.parentElement ?? null;
    if (!pre || !container) {
      return;
    }

    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-code");
    copyButton.type = "button";
    copyButton.innerHTML = copyIcon;
    copyButton.title = labelCopy;
    copyButton.setAttribute("aria-label", labelCopy);

    function showIcon(icon: string, label: string): void {
      copyButton.innerHTML = icon;
      copyButton.title = label;
      copyButton.setAttribute("aria-label", label);
    }

    function copyingDone(): void {
      showIcon(copiedIcon, labelCopied);
      window.setTimeout(() => {
        showIcon(copyIcon, labelCopy);
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

      const finish = (): void => {
        copyingDone();
      };

      if ("clipboard" in navigator) {
        void navigator.clipboard.writeText(content).then(finish).catch(() => {
          // Leave the icon unchanged when the clipboard is blocked.
        });
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
        finish();
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
