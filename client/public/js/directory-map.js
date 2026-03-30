(function () {
  var businesses = [
    {
      name: "رستوران نمونه",
      cat: "food",
      city: "london",
      borough: "kensington-chelsea",
      lat: 51.4994,
      lng: -0.194,
      url: "business.html",
      promoted: true,
      logo:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=256&h=256&q=80",
    },
    {
      name: "کلینیک پارس",
      cat: "health",
      city: "manchester",
      borough: "manchester-city-centre",
      lat: 53.4808,
      lng: -2.2426,
      url: "business-claimed.html",
      promoted: true,
      logo:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=256&h=256&q=80",
    },
    {
      name: "سوپرمارکت برکت",
      cat: "market",
      city: "manchester",
      borough: "rusholme",
      lat: 53.457,
      lng: -2.226,
      url: "business.html",
      promoted: false,
      logo:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=256&h=256&q=80",
    },
    {
      name: "دفتر وکالت آریا",
      cat: "legal",
      city: "london",
      borough: "camden",
      lat: 51.5155,
      lng: -0.0922,
      url: "business.html",
      promoted: false,
      logo:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=256&h=256&q=80",
    },
  ];

  var cityFa = { london: "لندن", manchester: "منچستر", birmingham: "برمنگام", glasgow: "گلاسگو" };
  var catFa = {
    food: "غذا و رستوران",
    health: "سلامت و پزشکی",
    market: "سوپرمارکت و مواد غذایی",
    legal: "حقوقی و مهاجرت",
    beauty: "زیبایی و آرایشگاه",
    auto: "خودرو و سرویس",
  };
  var boroughFa = {
    "kensington-chelsea": "کنزینگتون و چلسی",
    camden: "کمدن",
    "manchester-city-centre": "مرکز منچستر",
    rusholme: "راشولم",
  };

  /** پیش‌فرض: مرکز لندن */
  var LONDON_CENTER = [51.5074, -0.1278];
  var LONDON_ZOOM = 11;
  /** زوم نزدیک پس از دریافت موقعیت کاربر (سطح ~خیابان؛ حداکثر معمول Leaflet ۱۹ است) */
  var USER_LOCATION_ZOOM = 15;

  var OSM_MAX_ZOOM = 19;
  var GEO_PROMPT_KEY = "iraniu_map_geo_prompt_done_v1";

  var el = document.getElementById("directory-map");
  if (!el || typeof L === "undefined") return;

  var modal = document.getElementById("map-business-modal");
  var modalTitle = document.getElementById("map-business-modal-title");
  var modalMeta = document.getElementById("map-business-modal-meta");
  var modalLogoImg = document.getElementById("map-business-modal-logo");
  var modalLogoPh = document.getElementById("map-business-modal-logo-ph");
  var modalLogoWrap = document.getElementById("map-business-modal-logo-wrap");
  var modalCta = document.getElementById("map-business-modal-cta");
  var modalBadge = document.getElementById("map-business-modal-badge");
  var modalPanel = modal ? modal.querySelector(".map-business-modal__panel") : null;
  var modalCloseBtn = modal ? modal.querySelector(".map-business-modal__close") : null;
  var lastFocusEl = null;

  function firstChar(name) {
    var s = String(name || "").trim();
    return s ? s.charAt(0) : "؟";
  }

  function setModalLogo(b) {
    if (!modalLogoImg || !modalLogoPh) return;
    if (modalLogoWrap) modalLogoWrap.classList.remove("is-loaded");
    modalLogoPh.textContent = firstChar(b.name);
    modalLogoImg.onload = null;
    modalLogoImg.onerror = null;

    function markLogoShimmerDone() {
      if (modalLogoWrap) modalLogoWrap.classList.add("is-loaded");
    }

    if (b.logo) {
      modalLogoImg.alt = b.name;
      modalLogoImg.onload = function () {
        modalLogoImg.hidden = false;
        modalLogoPh.hidden = true;
        markLogoShimmerDone();
      };
      modalLogoImg.onerror = function () {
        modalLogoImg.hidden = true;
        modalLogoPh.hidden = false;
        modalLogoImg.removeAttribute("src");
        markLogoShimmerDone();
      };
      modalLogoImg.hidden = true;
      modalLogoPh.hidden = false;
      modalLogoImg.src = b.logo;
      if (modalLogoImg.complete && modalLogoImg.naturalHeight > 0) {
        modalLogoImg.hidden = false;
        modalLogoPh.hidden = true;
        markLogoShimmerDone();
      }
    } else {
      modalLogoImg.removeAttribute("src");
      modalLogoImg.hidden = true;
      modalLogoPh.hidden = false;
      markLogoShimmerDone();
    }
  }

  function openMapBusinessModal(b) {
    if (!modal || !modalTitle || !modalMeta || !modalCta || !modalPanel) return;
    lastFocusEl = document.activeElement;
    modalTitle.textContent = b.name;
    var catLine = catFa[b.cat] || b.cat;
    var boroughLine = boroughFa[b.borough] || b.borough || "";
    var cityLine = cityFa[b.city] || b.city;
    modalMeta.textContent = boroughLine ? catLine + " · " + boroughLine + " · " + cityLine : catLine + " · " + cityLine;
    modalCta.href = b.url;
    setModalLogo(b);
    if (modalBadge) {
      modalBadge.hidden = !b.promoted;
    }
    modalPanel.classList.toggle("map-business-modal__panel--promoted", !!b.promoted);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  }

  function closeMapBusinessModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (modalLogoImg) {
      modalLogoImg.onload = null;
      modalLogoImg.onerror = null;
    }
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-map-modal-dismiss]")) {
        closeMapBusinessModal();
      }
    });
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeMapBusinessModal);
    }
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape" && !modal.hidden) {
          e.preventDefault();
          closeMapBusinessModal();
        }
      },
      true
    );
  }

  function roundIcon(promoted) {
    return L.divIcon({
      className: "map-pin-wrap",
      html:
        '<span class="map-pin' +
        (promoted ? " map-pin--ad" : "") +
        '" role="img" aria-hidden="true"></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -12],
    });
  }

  var map = L.map("directory-map", {
    scrollWheelZoom: true,
    maxZoom: OSM_MAX_ZOOM,
  }).setView(LONDON_CENTER, LONDON_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: OSM_MAX_ZOOM,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a>',
  }).addTo(map);

  var markers = [];
  businesses.forEach(function (b) {
    var m = L.marker([b.lat, b.lng], { icon: roundIcon(b.promoted) });
    m.on("click", function () {
      openMapBusinessModal(b);
    });
    markers.push({ business: b, marker: m });
  });

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  function getFilterEls() {
    return {
      catEl: document.getElementById("map-filter-cat"),
      boroughEl: document.getElementById("map-filter-borough"),
      qEl: document.getElementById("map-filter-q"),
    };
  }

  function getVisibleBusinessMarkers() {
    var els = getFilterEls();
    var cat = els.catEl ? els.catEl.value : "";
    var borough = els.boroughEl ? els.boroughEl.value : "";
    var q = els.qEl ? norm(els.qEl.value) : "";

    var visible = [];
    markers.forEach(function (item) {
      var biz = item.business;
      var show = true;
      if (cat && biz.cat !== cat) show = false;
      if (borough && biz.borough !== borough) show = false;
      if (q && norm(biz.name).indexOf(q) === -1) show = false;
      if (show) visible.push(item.marker);
    });
    return visible;
  }

  function getVisibleEntries() {
    var vis = getVisibleBusinessMarkers();
    var out = [];
    markers.forEach(function (item) {
      if (vis.indexOf(item.marker) !== -1) out.push(item);
    });
    return out;
  }

  function syncMarkerVisibility(visible) {
    markers.forEach(function (item) {
      if (visible.indexOf(item.marker) !== -1) {
        item.marker.addTo(map);
      } else {
        map.removeLayer(item.marker);
      }
    });
  }

  function boundsFromMarkers(layerMarkers) {
    if (layerMarkers.length === 0) return null;
    var b = L.latLngBounds(layerMarkers[0].getLatLng(), layerMarkers[0].getLatLng());
    for (var i = 1; i < layerMarkers.length; i++) {
      b.extend(layerMarkers[i].getLatLng());
    }
    return b;
  }

  function fitMapToLayers(businessLayers) {
    if (businessLayers.length === 0) {
      map.setView(LONDON_CENTER, LONDON_ZOOM);
      return;
    }
    if (businessLayers.length === 1) {
      map.setView(businessLayers[0].getLatLng(), Math.min(USER_LOCATION_ZOOM, OSM_MAX_ZOOM));
      return;
    }
    var bb = boundsFromMarkers(businessLayers);
    if (!bb) {
      map.setView(LONDON_CENTER, LONDON_ZOOM);
      return;
    }
    map.fitBounds(bb, {
      padding: [36, 36],
      maxZoom: USER_LOCATION_ZOOM,
      minZoom: 4,
    });
  }

  function applyFilters() {
    var visible = getVisibleBusinessMarkers();
    syncMarkerVisibility(visible);
    fitMapToLayers(visible);
  }

  function resetFilters() {
    var els = getFilterEls();
    if (els.catEl) els.catEl.value = "";
    if (els.boroughEl) els.boroughEl.value = "";
    if (els.qEl) els.qEl.value = "";
    applyFilters();
  }

  function requestUserLocationOnce() {
    var geoResolved = false;
    function fallbackFit() {
      if (geoResolved) return;
      geoResolved = true;
      applyFilters();
    }
    try {
      if (localStorage.getItem(GEO_PROMPT_KEY)) return;
    } catch (e) {
      return;
    }
    if (!navigator.geolocation) {
      try {
        localStorage.setItem(GEO_PROMPT_KEY, "1");
      } catch (e2) {}
      fallbackFit();
      return;
    }
    try {
      localStorage.setItem(GEO_PROMPT_KEY, "1");
    } catch (e3) {}
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        geoResolved = true;
        map.flyTo([pos.coords.latitude, pos.coords.longitude], USER_LOCATION_ZOOM, { duration: 0.85 });
      },
      function () {
        fallbackFit();
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
    setTimeout(fallbackFit, 13000);
  }

  applyFilters();

  window.addEventListener("load", function () {
    map.invalidateSize();
    var alreadyAskedGeo = false;
    try {
      alreadyAskedGeo = !!localStorage.getItem(GEO_PROMPT_KEY);
    } catch (e) {
      /* حالت خصوصی / مسدود بودن localStorage: بدون درخواست موقعیت، فقط فیت فیلتر */
      alreadyAskedGeo = true;
    }
    if (alreadyAskedGeo) {
      applyFilters();
    } else {
      requestUserLocationOnce();
    }
  });

  function bind(id, ev) {
    var node = document.getElementById(id);
    if (node) node.addEventListener(ev, applyFilters);
  }

  bind("map-filter-q", "input");
  bind("map-filter-borough", "change");
  bind("map-filter-cat", "change");

  var resetBtn = document.getElementById("map-filter-reset");
  if (resetBtn) resetBtn.addEventListener("click", resetFilters);
})();
