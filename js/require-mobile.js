(function () {
  /* ≥1025px = دسکتاپ؛ ۱۰۲۴px (مثلاً تبلت افقی) همچنان مجاز */
  var mq = window.matchMedia("(min-width: 1025px)");
  var gate = null;

  
  /** پنل ادمین، پنل مالک، تبلیغات و بسته‌ها روی دسکتاپ هم باز می‌شوند؛ بقیهٔ سایت موبایل‌محور می‌ماند */
  function allowDesktop() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop() || "";
    if (file === "dashboard.html") return true;
    if (file === "advertise.html") return true;
    if (file === "admin.html") return true;
    return /^admin-[^/]+\.html$/.test(file);
  }

  function update() {
    if (allowDesktop()) {
      document.documentElement.classList.remove("iraniu-desktop-blocked");
      if (gate && gate.parentNode) {
        gate.parentNode.removeChild(gate);
      }
      gate = null;
      return;
    }

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
