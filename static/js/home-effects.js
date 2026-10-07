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

  // scripts/home-effects.ts
  function initHomeListToggles() {
    document.querySelectorAll(".toggle-content").forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const homeList = toggle.closest(".home-list");
        if (!homeList) {
          return;
        }
        const content = homeList.querySelector(".home-list-content");
        if (!content) {
          return;
        }
        const isExpanded = content.classList.toggle("show");
        homeList.classList.toggle("is-expanded", isExpanded);
        toggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      });
    });
  }
  function initHomeRevealEffects() {
    const revealTargets = Array.from(document.querySelectorAll(".reveal-on-scroll")).filter(
      (target) => !target.closest(".is-home") && !target.closest("[data-list-paginate='true']")
    );
    if (!revealTargets.length) {
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      revealTargets.forEach((target) => {
        target.classList.add("is-visible");
      });
      return;
    }
    revealTargets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${Math.min(index * 60, 360)}ms`);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );
    revealTargets.forEach((target) => {
      observer.observe(target);
    });
  }
  onReady(() => {
    initHomeListToggles();
    initHomeRevealEffects();
  });
})();
