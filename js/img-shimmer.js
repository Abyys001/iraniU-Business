/**
 * Marks .img-shimmer-host as loaded when the inner <img> finishes (or errors).
 */
(function () {
  "use strict";

  function markLoaded(host) {
    if (host) host.classList.add("is-loaded");
  }

  function bindImg(img) {
    var host = img.closest(".img-shimmer-host");
    if (!host) return;

    function done() {
      markLoaded(host);
    }

    if (img.complete && img.naturalWidth > 0) {
      done();
      return;
    }

    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }

  document.querySelectorAll(".img-shimmer-host img").forEach(bindImg);
})();
