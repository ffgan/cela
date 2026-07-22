function initListPagination(root) {
  const pageSize = Math.max(
    1,
    Number(root.dataset.paginateBy || 5) || 5,
  );
  const items = Array.from(
    root.querySelectorAll(":scope > .post-entry"),
  );
  if (items.length <= pageSize) {
    return;
  }

  const footerNav = root.parentElement
    ? root.parentElement.querySelector("[data-list-pagination]")
    : null;
  if (!footerNav) {
    return;
  }

  const headings = Array.from(
    root.querySelectorAll(":scope > [data-list-heading]"),
  );
  const totalPages = Math.ceil(items.length / pageSize);
  let currentPage = 1;

  const previous = document.createElement("a");
  previous.className = "previous";
  previous.href = "#";
  previous.rel = "prev";
  previous.textContent = "« Previous";

  const info = document.createElement("span");
  info.className = "pagination-info";

  const next = document.createElement("a");
  next.className = "next";
  next.href = "#";
  next.rel = "next";
  next.textContent = "Next »";

  footerNav.append(previous, info, next);
  footerNav.hidden = false;

  function syncHeadingVisibility() {
    headings.forEach(function (heading) {
      let sibling = heading.nextElementSibling;
      let visible = false;
      while (sibling && !sibling.hasAttribute("data-list-heading")) {
        if (
          sibling.classList.contains("post-entry") &&
          sibling.style.display !== "none"
        ) {
          visible = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      heading.style.display = visible ? "" : "none";
    });
  }

  function render() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    items.forEach(function (item, index) {
      item.style.display = index >= start && index < end ? "" : "none";
    });
    syncHeadingVisibility();

    info.textContent = currentPage + " / " + totalPages;
    previous.style.visibility = currentPage > 1 ? "visible" : "hidden";
    next.style.visibility = currentPage < totalPages ? "visible" : "hidden";
  }

  previous.addEventListener("click", function (event) {
    event.preventDefault();
    if (currentPage <= 1) {
      return;
    }
    currentPage -= 1;
    render();
    root.scrollIntoView({ block: "start" });
  });

  next.addEventListener("click", function (event) {
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

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll("[data-list-paginate='true']")
    .forEach(initListPagination);
});
