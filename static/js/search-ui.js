function initSearchOverlay() {
  const searchPageUrl = document.body.dataset.searchPageUrl;
  const searchToggleBox = document.getElementById("search-toggle-box");
  const searchToggleModal = document.querySelector("#search-toggle-box .search-toggle-modal");
  const searchToggleInput = document.getElementById("search-toggle-input");
  const searchToggleButton = document.getElementById("search-toggle-button");
  const searchToggleCancel = document.getElementById("search-toggle-cancel");
  const searchToggleLinks = document.querySelectorAll('[data-search-toggle="true"]');

  if (
    !searchToggleBox ||
    !searchToggleModal ||
    !searchToggleInput ||
    !searchToggleButton ||
    !searchToggleLinks.length ||
    !searchPageUrl
  ) {
    return;
  }

  function closeSearchOverlay() {
    searchToggleBox.classList.add("hidden");
  }

  function openSearchOverlay() {
    searchToggleBox.classList.remove("hidden");
    searchToggleInput.focus();
  }

  function submitSearch() {
    const searchTerm = searchToggleInput.value.trim();
    if (!searchTerm) {
      alert("Please enter a search term.");
      return;
    }
    window.location.assign(`${searchPageUrl}?q=${encodeURIComponent(searchTerm)}`);
  }

  searchToggleLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openSearchOverlay();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearchOverlay();
      return;
    }

    if (event.key === "Enter" && document.activeElement === searchToggleInput) {
      submitSearch();
    }
  });

  document.addEventListener("click", function (event) {
    const clickedToggle = Array.from(searchToggleLinks).some(function (link) {
      return link.contains(event.target);
    });
    const isClickInside =
      searchToggleModal.contains(event.target) || clickedToggle;
    if (!isClickInside) {
      closeSearchOverlay();
    }
  });

  searchToggleButton.addEventListener("click", submitSearch);
  if (searchToggleCancel) {
    searchToggleCancel.addEventListener("click", closeSearchOverlay);
  }
}

document.addEventListener("DOMContentLoaded", initSearchOverlay);
