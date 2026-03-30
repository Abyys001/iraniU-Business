(function () {
  "use strict";

  var COUNT_NS = "iraniu-qr";
  var STORAGE_BID = "iraniu_dashboard_qr_business_id";
  var STORAGE_REVIEW_URL = "iraniu_dashboard_qr_google_review_url";
  var STORAGE_PRINT_THEME = "iraniu_dashboard_qr_print_theme";

  var THEME_QR_COLORS = {
    1: { dark: "#2d082f", light: "#ffffff" },
    2: { dark: "#094950", light: "#ffffff" },
    3: { dark: "#4a3206", light: "#ffffff" },
    4: { dark: "#152a45", light: "#ffffff" },
    5: { dark: "#5c1528", light: "#ffffff" },
    6: { dark: "#14532d", light: "#ffffff" },
    7: { dark: "#9a3412", light: "#ffffff" },
    8: { dark: "#312e81", light: "#ffffff" },
    9: { dark: "#1e293b", light: "#ffffff" },
    10: { dark: "#831843", light: "#ffffff" },
    11: { dark: "#365314", light: "#ffffff" },
    12: { dark: "#075985", light: "#ffffff" },
    13: { dark: "#450a0a", light: "#ffffff" },
    14: { dark: "#5b21b6", light: "#ffffff" },
    15: { dark: "#92400e", light: "#ffffff" },
    16: { dark: "#134e4a", light: "#ffffff" },
    17: { dark: "#581c87", light: "#ffffff" },
    18: { dark: "#1e3a8a", light: "#ffffff" },
    19: { dark: "#9f1239", light: "#ffffff" },
    20: { dark: "#155e75", light: "#ffffff" },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function toBase64Url(str) {
    var b = btoa(unescape(encodeURIComponent(str)));
    return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function sanitizeBid(raw) {
    var s = String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return s || "business";
  }

  function counterKey(bid) {
    return "qr_" + sanitizeBid(bid).slice(0, 80);
  }

  function buildTrackingUrl(googleReviewUrl, bid) {
    var base = new URL("review-redirect.html", window.location.href);
    base.searchParams.set("bid", sanitizeBid(bid));
    base.searchParams.set("t", toBase64Url(googleReviewUrl));
    return base.href;
  }

  function fetchScanCount(bid) {
    var key = counterKey(bid);
    return fetch("https://api.countapi.xyz/get/" + COUNT_NS + "/" + key)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && typeof data.value === "number") return data.value;
        return 0;
      })
      .catch(function () {
        return null;
      });
  }

  var state = {
    trackingUrl: "",
    logoObjectUrl: null,
  };

  function setLogoPreview(file) {
    var img = $("qr-logo-preview");
    if (state.logoObjectUrl) {
      URL.revokeObjectURL(state.logoObjectUrl);
      state.logoObjectUrl = null;
    }
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      if (img) img.removeAttribute("src");
      return;
    }
    state.logoObjectUrl = URL.createObjectURL(file);
    if (img) {
      img.src = state.logoObjectUrl;
      img.hidden = false;
    }
  }

  function getThemeNum() {
    var sel = $("qr-print-theme");
    var n = sel ? parseInt(sel.value, 10) : 1;
    if (isNaN(n) || n < 1) n = 1;
    if (n > 20) n = 20;
    return n;
  }

  function qrColorsForTheme(themeNum) {
    return THEME_QR_COLORS[themeNum] || THEME_QR_COLORS[1];
  }

  function renderPrintSheet(qrDataUrl, businessName, themeNum) {
    var mount = $("qr-print-mount");
    if (!mount) return;
    var t = themeNum != null ? themeNum : getThemeNum();
    var name = businessName || "کسب‌وکار شما";
    var logoBlock = state.logoObjectUrl
      ? '<div class="qr-tpl__logo"><img src="' + state.logoObjectUrl + '" alt="" /></div>'
      : "";

    mount.innerHTML =
      '<div class="qr-tpl qr-tpl__sheet" data-qr-theme="' +
      t +
      '">' +
      '<div class="qr-tpl__frame">' +
      '<div class="qr-tpl__ribbon" dir="ltr" lang="en">' +
      '<span class="qr-tpl__deco qr-tpl__deco--tl" aria-hidden="true"></span>' +
      '<p class="qr-tpl__ribbon-title">Review us on Google</p>' +
      '<p class="qr-tpl__ribbon-sub">Scan the QR code to leave a review</p>' +
      '<span class="qr-tpl__deco qr-tpl__deco--br" aria-hidden="true"></span>' +
      "</div>" +
      '<div class="qr-tpl__body">' +
      logoBlock +
      '<div class="qr-tpl__qr"><img src="' +
      qrDataUrl +
      '" alt="" width="220" height="220" /></div>' +
      '<p class="qr-tpl__headline">از حمایت شما سپاسگزاریم</p>' +
      '<p class="qr-tpl__hint">با اسکن کد به صفحهٔ نظرات Google هدایت می‌شوید.</p>' +
      '<p class="qr-tpl__biz">' +
      escapeHtml(name) +
      "</p>" +
      "</div>" +
      '<div class="qr-tpl__strip">' +
      '<div class="qr-tpl__strip-url" dir="ltr" lang="en">www.iraniu.uk</div>' +
      '<div class="qr-tpl__strip-slogan" dir="rtl" lang="fa">فهرست کسب‌وکارهای ایرانی در بریتانیا</div>' +
      "</div>" +
      "</div></div>";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function doPrint(qrDataUrl) {
    var nameEl = $("qr-review-business-name");
    var name = nameEl && nameEl.value ? nameEl.value.trim() : "نام کسب‌وکار";
    renderPrintSheet(qrDataUrl, name, getThemeNum());
    window.print();
  }

  function init() {
    var bidInput = $("qr-review-bid");
    var urlInput = $("qr-review-google-url");
    var logoInput = $("qr-review-logo");
    var btnGen = $("qr-btn-generate");
    var btnPrint = $("qr-btn-print");
    var btnRefresh = $("qr-btn-refresh-stats");
    var previewWrap = $("qr-preview-wrap");
    var canvasParent = $("qr-canvas-parent");
    var trackingField = $("qr-tracking-url");
    var countEl = $("qr-scan-count");
    var statsHint = $("qr-stats-hint");
    var themeSelect = $("qr-print-theme");

    if (!btnGen || typeof QRCode === "undefined") {
      if (statsHint && typeof QRCode === "undefined") {
        statsHint.textContent =
          "کتابخانهٔ QR بارگذاری نشد؛ اتصال اینترنت را بررسی کنید.";
      }
      return;
    }

    try {
      bidInput.value = localStorage.getItem(STORAGE_BID) || "safra-demo";
      urlInput.value = localStorage.getItem(STORAGE_REVIEW_URL) || "";
      var savedTheme = localStorage.getItem(STORAGE_PRINT_THEME);
      if (themeSelect && savedTheme) {
        var stn = parseInt(savedTheme, 10);
        if (!isNaN(stn) && stn >= 1 && stn <= 20) {
          themeSelect.value = String(stn);
        }
      }
    } catch (e) {}

    if (themeSelect) {
      themeSelect.addEventListener("change", function () {
        try {
          localStorage.setItem(STORAGE_PRINT_THEME, themeSelect.value);
        } catch (e) {}
        var canvas = canvasParent && canvasParent.querySelector("canvas");
        if (canvas && state.trackingUrl) {
          QRCode.toCanvas(
            canvas,
            state.trackingUrl,
            {
              width: 220,
              margin: 2,
              color: qrColorsForTheme(getThemeNum()),
            },
            function () {}
          );
        }
      });
    }

    if (logoInput) {
      logoInput.addEventListener("change", function () {
        var f = logoInput.files && logoInput.files[0];
        if (!f) {
          if (state.logoObjectUrl) {
            URL.revokeObjectURL(state.logoObjectUrl);
            state.logoObjectUrl = null;
          }
          var im = $("qr-logo-preview");
          if (im) {
            im.removeAttribute("src");
          }
          return;
        }
        setLogoPreview(f);
      });
    }

    function setHeroQrCount(n) {
      var hero = $("dash-metric-qr-scans");
      if (!hero) return;
      if (n === null) {
        hero.textContent = "—";
      } else {
        hero.textContent = String(n);
      }
    }

    function updateAnalytics() {
      var bid = sanitizeBid(bidInput.value);
      countEl.textContent = "…";
      statsHint.textContent = "";
      setHeroQrCount("…");
      fetchScanCount(bid).then(function (n) {
        if (n === null) {
          countEl.textContent = "—";
          setHeroQrCount(null);
          statsHint.textContent =
            "شمارش سراسری در دسترس نیست (محدودیت شبکه یا سرویس). هر اسکن از طریق لینک ردیابی ثبت می‌شود.";
        } else {
          countEl.textContent = String(n);
          setHeroQrCount(n);
          statsHint.textContent =
            "اسکن با باز کردن لینک ردیابی (QR) ثبت می‌شود؛ لینک مستقیم Google شمارش نمی‌خورد.";
        }
      });
    }

    btnGen.addEventListener("click", function () {
      var bid = sanitizeBid(bidInput.value);
      var reviewUrl = (urlInput.value || "").trim();
      if (!reviewUrl) {
        alert("لینک صفحهٔ نظر Google را وارد کنید.");
        return;
      }
      try {
        localStorage.setItem(STORAGE_BID, bidInput.value.trim() || bid);
        localStorage.setItem(STORAGE_REVIEW_URL, reviewUrl);
        localStorage.setItem(STORAGE_PRINT_THEME, String(getThemeNum()));
      } catch (e) {}

      bidInput.value = bid;

      var trackUrl = buildTrackingUrl(reviewUrl, bid);
      state.trackingUrl = trackUrl;
      trackingField.value = trackUrl;
      canvasParent.innerHTML = "";
      var canvas = document.createElement("canvas");
      canvas.setAttribute("aria-label", "کد QR");
      canvasParent.appendChild(canvas);

      var colors = qrColorsForTheme(getThemeNum());

      QRCode.toCanvas(
        canvas,
        trackUrl,
        {
          width: 220,
          margin: 2,
          color: colors,
        },
        function (err) {
          if (err) {
            canvasParent.textContent = "خطا در ساخت QR.";
            return;
          }
          previewWrap.hidden = false;
          btnPrint.disabled = false;
          updateAnalytics();
        }
      );
    });

    btnRefresh.addEventListener("click", updateAnalytics);

    btnPrint.addEventListener("click", function () {
      var canvas = canvasParent.querySelector("canvas");
      if (!canvas) return;
      var dataUrl = canvas.toDataURL("image/png");
      doPrint(dataUrl);
    });

    statsHint.textContent =
      "پس از «ساخت QR» می‌توانید آمار اسکن و چاپ را امتحان کنید.";

    updateAnalytics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
