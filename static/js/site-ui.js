function initMenuScrollPersistence() {
  const menu = document.getElementById("menu");
  if (!menu) {
    return;
  }

  menu.scrollLeft = Number(localStorage.getItem("menu-scroll-position") || 0);
  menu.addEventListener("scroll", function () {
    localStorage.setItem("menu-scroll-position", String(menu.scrollLeft));
  });
}

function initNavDrawer() {
  const drawer = document.getElementById("nav-drawer");
  const toggle = document.getElementById("nav-drawer-toggle");
  const sheet = document.getElementById("nav-drawer-sheet");
  if (!drawer || !toggle || !sheet) {
    return;
  }

  const mq = window.matchMedia("(max-width: 768px)");
  let lastFocused = null;

  function isMobile() {
    return mq.matches;
  }

  function setToggleState(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function setDialogAttrs(open) {
    if (open) {
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-modal", "true");
      sheet.setAttribute("aria-label", "Site navigation");
    } else {
      sheet.removeAttribute("role");
      sheet.removeAttribute("aria-modal");
      sheet.removeAttribute("aria-label");
    }
  }

  function openDrawer() {
    if (!isMobile() || drawer.classList.contains("is-open")) {
      return;
    }
    lastFocused = document.activeElement;
    drawer.hidden = false;
    // Force reflow so the open transition runs after un-hiding.
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    document.body.classList.add("nav-drawer-open");
    setToggleState(true);
    setDialogAttrs(true);
    const closeBtn = drawer.querySelector("[data-nav-drawer-close].md-icon-button");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeDrawer() {
    if (!drawer.classList.contains("is-open") && drawer.hidden) {
      return;
    }
    drawer.classList.remove("is-open");
    document.body.classList.remove("nav-drawer-open");
    setToggleState(false);
    setDialogAttrs(false);

    function finalizeHide() {
      if (!drawer.classList.contains("is-open")) {
        drawer.hidden = true;
      }
    }

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      finalizeHide();
    } else {
      window.setTimeout(finalizeHide, 320);
    }

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      toggle.focus();
    }
  }

  function toggleDrawer() {
    if (drawer.classList.contains("is-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleDrawer();
  });

  drawer.querySelectorAll("[data-nav-drawer-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });

  drawer.querySelectorAll(".md-nav-item").forEach(function (link) {
    link.addEventListener("click", function () {
      if (isMobile()) {
        closeDrawer();
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  function onViewportChange() {
    if (!isMobile()) {
      closeDrawer();
    }
  }

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onViewportChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onViewportChange);
  }
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const href = anchor.getAttribute("href");
      const id = href ? href.slice(1) : "";
      const target = id
        ? document.querySelector(`[id='${decodeURIComponent(id)}']`)
        : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

      if (id === "top") {
        history.replaceState(null, "", " ");
      } else {
        history.pushState(null, "", `#${id}`);
      }
    });
  });
}

function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    return;
  }
  const surface = getComputedStyle(document.documentElement)
    .getPropertyValue("--md-surface")
    .trim();
  if (surface) {
    meta.setAttribute("content", surface);
  }
}

function initAppBarScroll() {
  const header = document.querySelector(".header");
  if (!header) {
    return;
  }

  function syncScrolled() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  syncScrolled();
  window.addEventListener("scroll", syncScrolled, { passive: true });
}

function initTopLink() {
  const topLink = document.getElementById("top-link");
  if (!topLink) {
    return;
  }

  function syncTopLink() {
    const shouldShow =
      document.body.scrollTop > 800 || document.documentElement.scrollTop > 800;
    topLink.classList.toggle("is-visible", shouldShow);
  }

  syncTopLink();
  window.addEventListener("scroll", syncTopLink, { passive: true });
}

function normalizeScheme(value) {
  if (!value) {
    return null;
  }
  if (value === "light" || value === "catppuccin-latte") {
    return "light";
  }
  if (
    value === "dark" ||
    value === "catppuccin-macchiato" ||
    value === "rose-pine" ||
    value === "nord"
  ) {
    return "dark";
  }
  return null;
}

function initThemeToggle() {
  if (document.body.dataset.showThemeToggle !== "true") {
    return;
  }
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    const current = normalizeScheme(document.documentElement.getAttribute("data-scheme")) || "light";
    const next = current === "light" ? "dark" : "light";
    applyScheme(next);
  });
}

function initCodeCopyButtons() {
  if (document.body.dataset.showCodeCopyButtons !== "true") {
    return;
  }

  document.querySelectorAll("pre > code").forEach(function (codeBlock) {
    const container = codeBlock.parentNode.parentNode;
    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-code");
    copyButton.type = "button";
    copyButton.textContent = "copy";

    function copyingDone() {
      copyButton.textContent = "copied!";
      window.setTimeout(function () {
        copyButton.textContent = "copy";
      }, 2000);
    }

    copyButton.addEventListener("click", function () {
      if ("clipboard" in navigator) {
        let content = codeBlock.textContent;
        if (codeBlock.firstChild && codeBlock.firstChild.tagName === "TABLE") {
          content = Array.from(
            codeBlock.firstChild.getElementsByTagName("span"),
          )
            .map(function (span) {
              return span.textContent;
            })
            .join("");
        }
        navigator.clipboard.writeText(content);
        copyingDone();
        return;
      }

      const range = document.createRange();
      range.selectNodeContents(codeBlock);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
        copyingDone();
      } catch (_) {
        // Ignore browsers that reject the legacy copy path.
      }
      selection.removeRange(range);
    });

    if (container.classList.contains("highlight")) {
      container.appendChild(copyButton);
    } else if (container.parentNode.firstChild === container) {
      return;
    } else if (
      codeBlock.parentNode.parentNode.parentNode.parentNode.parentNode
        .nodeName === "TABLE"
    ) {
      codeBlock.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(
        copyButton,
      );
    } else {
      codeBlock.parentNode.appendChild(copyButton);
    }
  });
}

function applyScheme(scheme) {
  const normalized = normalizeScheme(scheme) || "light";
  document.documentElement.setAttribute("data-scheme", normalized);
  const isDark = normalized === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark", isDark);
  if (document.body.dataset.rememberChoice === "true") {
    localStorage.setItem("pref-scheme", normalized);
  }
  syncThemeColor();
}

document.addEventListener("DOMContentLoaded", function () {
  initMenuScrollPersistence();
  initNavDrawer();
  initSmoothAnchors();
  initAppBarScroll();
  initTopLink();
  initThemeToggle();
  initCodeCopyButtons();
  syncThemeColor();
});
