/* Generated from scripts/*.ts. Edit the TypeScript source and run npm run build:js. */
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

  // scripts/search-ui.ts
  function initSearchOverlay() {
    const searchPageUrl = document.body.dataset.searchPageUrl;
    const searchToggleBox = document.getElementById("search-toggle-box");
    const searchToggleModal = document.querySelector("#search-toggle-box .search-toggle-modal");
    const searchToggleInput = document.getElementById("search-toggle-input");
    const searchToggleButton = document.getElementById("search-toggle-button");
    const searchToggleCancel = document.getElementById("search-toggle-cancel");
    const searchToggleLinks = document.querySelectorAll('[data-search-toggle="true"]');
    if (!searchToggleBox || !searchToggleModal || !(searchToggleInput instanceof HTMLInputElement) || !searchToggleButton || !searchToggleLinks.length || !searchPageUrl) {
      return;
    }
    function closeSearchOverlay() {
      searchToggleBox?.classList.add("hidden");
    }
    function openSearchOverlay() {
      searchToggleBox?.classList.remove("hidden");
      if (searchToggleInput instanceof HTMLInputElement) {
        searchToggleInput.focus();
      }
    }
    function submitSearch() {
      if (!(searchToggleInput instanceof HTMLInputElement) || !searchPageUrl) {
        return;
      }
      const searchTerm = searchToggleInput.value.trim();
      if (!searchTerm) {
        alert(document.body.dataset.uiSearchEmpty || "Please enter a search term.");
        return;
      }
      window.location.assign(`${searchPageUrl}?q=${encodeURIComponent(searchTerm)}`);
    }
    searchToggleLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openSearchOverlay();
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSearchOverlay();
        return;
      }
      if (event.key === "Enter" && document.activeElement === searchToggleInput) {
        submitSearch();
      }
    });
    document.addEventListener("click", (event) => {
      const target = eventNode(event);
      const clickedToggle = Array.from(searchToggleLinks).some((link) => target !== null && link.contains(target));
      const isClickInside = target !== null && searchToggleModal.contains(target) || clickedToggle;
      if (!isClickInside) {
        closeSearchOverlay();
      }
    });
    searchToggleButton.addEventListener("click", submitSearch);
    searchToggleCancel?.addEventListener("click", closeSearchOverlay);
  }
  onReady(initSearchOverlay);
})();
