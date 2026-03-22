(function () {
  var businesses = [
    {
      name: "رستوران سفره",
      cat: "food",
      city: "london",
      lat: 51.4994,
      lng: -0.194,
      url: "business.html",
      promoted: true,
    },
    {
      name: "کلینیک پارس",
      cat: "health",
      city: "manchester",
      lat: 53.4808,
      lng: -2.2426,
      url: "business-claimed.html",
      promoted: true,
    },
    {
      name: "سوپرمارکت برکت",
      cat: "market",
      city: "manchester",
      lat: 53.457,
      lng: -2.226,
      url: "business.html",
      promoted: false,
    },
    {
      name: "دفتر وکالت آریا",
      cat: "legal",
      city: "london",
      lat: 51.5155,
      lng: -0.0922,
      url: "business.html",
      promoted: false,
    },
  ];

  var cityFa = { london: "لندن", manchester: "منچستر", birmingham: "برمنگام", glasgow: "گلاسگو" };

  var METERS_PER_MILE = 1609.344;
  /** Default map frame: ~2 miles from the user when location is known */
  var USER_RADIUS_MILES = 2;
  /** When location is unknown: neighbourhood extent around visible pins */
  var FALLBACK_RADIUS_MILES = 1;

  function boundsForRadiusMiles(lat, lng, radiusMiles) {
    var meters = radiusMiles * METERS_PER_MILE;
    var latRad = (lat * Math.PI) / 180;
    var latDelta = meters / 111320;
    var lngDelta = meters / (111320 * Math.cos(latRad));
    return L.latLngBounds(
      [lat - latDelta, lng - lngDelta],
      [lat + latDelta, lng + lngDelta]
    );
  }

  function centroidOfMarkers(layerMarkers) {
    var sLat = 0;
    var sLng = 0;
    var n = layerMarkers.length;
    for (var i = 0; i < n; i++) {
      var ll = layerMarkers[i].getLatLng();
      sLat += ll.lat;
      sLng += ll.lng;
    }
    return L.latLng(sLat / n, sLng / n);
  }

  var el = document.getElementById("directory-map");
  if (!el || typeof L === "undefined") return;

  var statusEl = document.getElementById("map-geo-status");
  var shareBtn = document.getElementById("btn-share-location");
  var userMarker = null;
  /** @type {L.LatLng|null} */
  var userLatLng = null;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setGeoStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.classList.toggle("map-geo-status--error", !!isError);
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

  var userIcon = L.divIcon({
    className: "map-pin-wrap",
    html: '<span class="map-pin map-pin--user" role="img" aria-hidden="true"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });

  var map = L.map("directory-map", { scrollWheelZoom: true }).setView([54.2, -3.5], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a>',
  }).addTo(map);

  var markers = [];
  businesses.forEach(function (b) {
    var m = L.marker([b.lat, b.lng], { icon: roundIcon(b.promoted) }).bindPopup(
      '<div dir="rtl" class="map-popup-inner"><a href="' +
        b.url +
        '">' +
        escapeHtml(b.name) +
        "</a><br><small>" +
        escapeHtml(cityFa[b.city] || b.city) +
        "</small></div>"
    );
    markers.push({ business: b, marker: m });
  });

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  function getVisibleBusinessMarkers() {
    var catEl = document.getElementById("hero-search-cat");
    var cityEl = document.getElementById("hero-search-city");
    var featEl = document.getElementById("hero-featured");
    var qEl = document.getElementById("hero-search-q");

    var cat = catEl ? catEl.value : "";
    var city = cityEl ? cityEl.value : "";
    var featuredOnly = featEl && featEl.checked;
    var q = qEl ? norm(qEl.value) : "";

    var visible = [];
    markers.forEach(function (item) {
      var b = item.business;
      var show = true;
      if (cat && b.cat !== cat) show = false;
      if (city && b.city !== city) show = false;
      if (featuredOnly && !b.promoted) show = false;
      if (q && norm(b.name).indexOf(q) === -1) show = false;
      if (show) visible.push(item.marker);
    });
    return visible;
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

  function fitMapToLayers(businessLayers) {
    var layers = businessLayers.slice();
    if (userMarker && map.hasLayer(userMarker)) {
      layers.push(userMarker);
    }

    if (userLatLng) {
      var bUser = boundsForRadiusMiles(userLatLng.lat, userLatLng.lng, USER_RADIUS_MILES);
      for (var iu = 0; iu < layers.length; iu++) {
        bUser.extend(layers[iu].getLatLng());
      }
      map.fitBounds(bUser, { padding: [14, 14], maxZoom: 18, minZoom: 4 });
      return;
    }

    if (layers.length === 0) {
      map.setView([54.2, -3.5], 5);
      return;
    }

    var center = centroidOfMarkers(layers);
    var b = boundsForRadiusMiles(center.lat, center.lng, FALLBACK_RADIUS_MILES);
    for (var j = 0; j < layers.length; j++) {
      b.extend(layers[j].getLatLng());
    }

    map.fitBounds(b, { padding: [14, 14], maxZoom: 18, minZoom: 4 });
  }

  function applyFilters() {
    var visible = getVisibleBusinessMarkers();
    syncMarkerVisibility(visible);
    fitMapToLayers(visible);
  }

  function setUserLocation(lat, lng, openPopup) {
    userLatLng = L.latLng(lat, lng);
    if (userMarker) {
      map.removeLayer(userMarker);
    }
    userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<div dir="rtl" class="map-popup-inner">موقعیت تقریبی شما</div>');
    if (openPopup) {
      userMarker.openPopup();
    }
  }

  function handleGeoError(err, fromButton) {
    if (fromButton) {
      shareBtn.disabled = false;
      shareBtn.removeAttribute("aria-busy");
    }
    if (err.code === 1) {
      setGeoStatus(
        "برای نمایش خودکار نقشه در شعاع ۲ مایلی، اجازهٔ موقعیت را در مرورگر بدهید؛ یا بعداً دوباره تلاش کنید.",
        true
      );
    } else if (err.code === 2) {
      setGeoStatus("موقعیت در دسترس نبود. بعداً دوباره امتحان کنید.", true);
    } else if (err.code === 3) {
      setGeoStatus("زمان دریافت موقعیت به پایان رسید. دوباره تلاش کنید.", true);
    } else {
      setGeoStatus("امکان دریافت موقعیت نبود.", true);
    }
  }

  function getGeoOptions(forButton) {
    return {
      enableHighAccuracy: !!forButton,
      timeout: forButton ? 15000 : 12000,
      maximumAge: forButton ? 60000 : 300000,
    };
  }

  var initialVisible = getVisibleBusinessMarkers();
  syncMarkerVisibility(initialVisible);
  map.setView([54.2, -3.5], 5);

  if (navigator.geolocation) {
    setGeoStatus(
      "در حال درخواست موقعیت شما — پس از تأیید، نقشه روی حدود ۲ مایل اطراف شما زوم می‌شود."
    );
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setUserLocation(pos.coords.latitude, pos.coords.longitude, false);
        setGeoStatus("نقشه روی محدودهٔ حدود ۲ مایلی اطراف موقعیت شما تنظیم شد.");
        applyFilters();
      },
      function (err) {
        userLatLng = null;
        if (userMarker) {
          map.removeLayer(userMarker);
          userMarker = null;
        }
        if (err.code === 1) {
          setGeoStatus(
            "اجازهٔ موقعیت داده نشد؛ نمای کلی فهرست نشان داده می‌شود. می‌توانید از دکمهٔ زیر دوباره درخواست دهید.",
            true
          );
        } else if (err.code === 2) {
          setGeoStatus(
            "موقعیت در دسترس نبود؛ نمای کلی نشان داده می‌شود. بعداً دوباره امتحان کنید.",
            false
          );
        } else if (err.code === 3) {
          setGeoStatus(
            "زمان دریافت موقعیت تمام شد؛ نمای کلی نشان داده می‌شود. دوباره تلاش کنید.",
            false
          );
        } else {
          setGeoStatus(
            "موقعیت شما مشخص نشد؛ نمای کلی نتایج نشان داده می‌شود. می‌توانید دکمهٔ «اشتراک موقعیت من» را بزنید.",
            false
          );
        }
        applyFilters();
      },
      getGeoOptions(false)
    );
  } else {
    setGeoStatus("مرورگر از موقعیت جغرافیایی پشتیبانی نمی‌کند.", true);
    applyFilters();
  }

  window.addEventListener("load", function () {
    map.invalidateSize();
    applyFilters();
  });

  function bind(id, ev) {
    var node = document.getElementById(id);
    if (node) node.addEventListener(ev, applyFilters);
  }

  bind("hero-search-q", "input");
  bind("hero-search-city", "change");
  bind("hero-search-cat", "change");
  bind("hero-featured", "change");

  if (shareBtn && navigator.geolocation) {
    shareBtn.addEventListener("click", function () {
      setGeoStatus("در حال به‌روزرسانی موقعیت…");
      shareBtn.disabled = true;
      shareBtn.setAttribute("aria-busy", "true");

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          setUserLocation(pos.coords.latitude, pos.coords.longitude, true);
          setGeoStatus("موقعیت شما به‌روز شد؛ نقشه با شعاع حدود دو مایل دور شما تنظیم شد.");
          shareBtn.disabled = false;
          shareBtn.removeAttribute("aria-busy");
          applyFilters();
        },
        function (err) {
          handleGeoError(err, true);
        },
        getGeoOptions(true)
      );
    });
  } else if (shareBtn) {
    shareBtn.disabled = true;
  }
})();
