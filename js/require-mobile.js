(function () {
  /* ≥1025px = دسکتاپ؛ ۱۰۲۴px (مثلاً تبلت افقی) همچنان مجاز */
  var mq = window.matchMedia("(min-width: 1025px)");
  var gate = null;

  function mainHost() {
    return document.querySelector("main") || document.getElementById("main");
  }

  function placeGate() {
    if (!gate || !mq.matches) return;
    var host = mainHost();
    if (host && gate.parentNode !== host) {
      host.insertBefore(gate, host.firstChild);
    }
  }

  function update() {
    var blocked = mq.matches;
    if (blocked) {
      document.documentElement.classList.add("iraniu-desktop-blocked");
      if (!gate) {
        gate = document.createElement("div");
        gate.className = "iraniu-desktop-gate";
        gate.setAttribute("dir", "rtl");
        gate.setAttribute("lang", "fa");
        gate.innerHTML =
          '<div class="iraniu-desktop-gate__inner" role="alert" aria-live="assertive">' +
          '<p class="iraniu-desktop-gate__title">فقط موبایل و تبلت</p>' +
          '<p class="iraniu-desktop-gate__text">این نسخه فقط برای موبایل و تبلت است. لطفاً با گوشی یا تبلت همان آدرس را باز کنید.</p>' +
          "</div>";
        document.body.insertBefore(gate, document.body.firstChild);
        placeGate();
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", placeGate);
        }
      } else {
        placeGate();
      }
    } else {
      document.documentElement.classList.remove("iraniu-desktop-blocked");
      if (gate && gate.parentNode) {
        gate.parentNode.removeChild(gate);
      }
      gate = null;
    }
  }

  update();
  if (mq.addEventListener) {
    mq.addEventListener("change", update);
  } else {
    mq.addListener(update);
  }
})();
