(function () {
  "use strict";

  function closeSidebar() {
    document.querySelectorAll(".app-shell-sidebar-cb").forEach(function (cb) {
      cb.checked = false;
    });
  }

  document.querySelectorAll(".app-shell__nav a").forEach(function (link) {
    link.addEventListener("click", closeSidebar);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSidebar();
    }
  });
})();
