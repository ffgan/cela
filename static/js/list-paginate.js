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

  // scripts/list-paginate.ts
  function datesDescending(items) {
    for (let index = 1; index < items.length; index += 1) {
      const previous = items[index - 1]?.dataset.date || "";
      const current = items[index]?.dataset.date || "";
      if (current > previous) {
        return false;
      }
    }
    return true;
  }
  function setPageHidden(element, hidden) {
    element.classList.toggle("is-page-hidden", hidden);
    element.style.display = "";
  }
  function initListPagination(root) {
    const pageSize = Math.max(1, Number(root.dataset.paginateBy || 5) || 5);
    const headings = Array.from(root.querySelectorAll(":scope > [data-list-heading]"));
    const domItems = Array.from(root.querySelectorAll(":scope > .post-entry"));
    const items = domItems.slice().sort((a, b) => {
      const dateA = a.dataset.date || "";
      const dateB = b.dataset.date || "";
      if (dateA === dateB) {
        return 0;
      }
      return dateA < dateB ? 1 : -1;
    });
    if (!datesDescending(domItems)) {
      const headingsByYear = new Map(
        headings.map((heading) => [(heading.textContent || "").trim(), heading])
      );
      let currentYear = null;
      items.forEach((item) => {
        const year = item.dataset.date ? item.dataset.date.slice(0, 4) : "";
        if (year !== currentYear) {
          const heading = headingsByYear.get(year);
          if (heading) {
            root.appendChild(heading);
          }
          currentYear = year;
        }
        root.appendChild(item);
      });
    }
    if (items.length <= pageSize) {
      domItems.forEach((item) => {
        setPageHidden(item, false);
      });
      headings.forEach((heading) => {
        setPageHidden(heading, false);
      });
      return;
    }
    const footerNav = root.parentElement?.querySelector("[data-list-pagination]") ?? null;
    if (!(footerNav instanceof HTMLElement)) {
      return;
    }
    const totalPages = Math.ceil(items.length / pageSize);
    let currentPage = 1;
    const previous = document.createElement("a");
    previous.className = "previous";
    previous.href = "#";
    previous.rel = "prev";
    previous.textContent = `\xAB ${document.body.dataset.uiPrevious || "Previous"}`;
    const info = document.createElement("span");
    info.className = "pagination-info";
    const next = document.createElement("a");
    next.className = "next";
    next.href = "#";
    next.rel = "next";
    next.textContent = `${document.body.dataset.uiNext || "Next"} \xBB`;
    footerNav.append(previous, info, next);
    footerNav.hidden = false;
    function syncHeadingVisibility() {
      headings.forEach((heading) => {
        let sibling = heading.nextElementSibling;
        let visible = false;
        while (sibling && !sibling.hasAttribute("data-list-heading")) {
          if (sibling.classList.contains("post-entry") && !sibling.classList.contains("is-page-hidden")) {
            visible = true;
            break;
          }
          sibling = sibling.nextElementSibling;
        }
        setPageHidden(heading, !visible);
      });
    }
    function render() {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      items.forEach((item, index) => {
        setPageHidden(item, index < start || index >= end);
      });
      syncHeadingVisibility();
      info.textContent = `${currentPage} / ${totalPages}`;
      previous.style.visibility = currentPage > 1 ? "visible" : "hidden";
      next.style.visibility = currentPage < totalPages ? "visible" : "hidden";
    }
    previous.addEventListener("click", (event) => {
      event.preventDefault();
      if (currentPage <= 1) {
        return;
      }
      currentPage -= 1;
      render();
      root.scrollIntoView({ block: "start" });
    });
    next.addEventListener("click", (event) => {
      event.preventDefault();
      if (currentPage >= totalPages) {
        return;
      }
      currentPage += 1;
      render();
      root.scrollIntoView({ block: "start" });
    });
    render();
  }
  onReady(() => {
    document.querySelectorAll("[data-list-paginate='true']").forEach(initListPagination);
  });
})();
