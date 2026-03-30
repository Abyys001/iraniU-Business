(function () {
  "use strict";

  var modal = document.getElementById("admin-detail-modal");
  if (!modal) return;

  var backdrop = modal.querySelector("[data-admin-detail-dismiss]");
  var closeBtn = modal.querySelector(".admin-detail-modal__close");
  var titleEl = document.getElementById("adm-modal-title");
  var typeEl = document.getElementById("adm-modal-type");
  var bodyEl = document.getElementById("adm-modal-body");
  var noteEl = document.getElementById("adm-modal-note");
  var rejectEl = document.getElementById("adm-modal-reject");
  var rejectWrap = document.getElementById("adm-modal-reject-wrap");
  var toastEl = document.getElementById("adm-modal-toast");
  var lastFocus = null;
  var currentPayload = null;

  function parseLines(s) {
    if (!s) return [];
    return String(s)
      .split("||")
      .map(function (chunk) {
        var i = chunk.indexOf("::");
        if (i === -1) return { k: chunk, v: "" };
        return { k: chunk.slice(0, i).trim(), v: chunk.slice(i + 2).trim() };
      })
      .filter(function (x) {
        return x.k;
      });
  }

  function readTrigger(el) {
    var d = el.dataset;
    return {
      type: d.detailType || "item",
      title: d.detailTitle || "—",
      id: d.detailId || "",
      status: d.detailStatus || "",
      lines: parseLines(d.detailLines),
      profileHref: d.detailProfile || "",
      gbpHref: d.detailGbp || "",
      email: d.detailEmail || "",
      amount: d.detailAmount || "",
    };
  }

  var typeLabels = {
    business: "آگهی کسب‌وکار",
    claim: "درخواست ادعای مالکیت",
    invoice: "فاکتور / پرداخت",
    manager: "حساب مدیر",
    link: "پیش‌نمایش لینک",
    help: "راهنمای بخش",
  };

  function needsRejectReason(type) {
    return ["business", "claim", "invoice", "manager"].indexOf(type) !== -1;
  }

  function renderBody(p) {
    var html = '<dl class="admin-detail-modal__dl">';
    if (p.id) {
      html +=
        "<div><dt>شناسه</dt><dd dir=\"ltr\">" +
        escapeHtml(p.id) +
        "</dd></div>";
    }
    if (p.status) {
      html += "<div><dt>وضعیت فعلی</dt><dd>" + escapeHtml(p.status) + "</dd></div>";
    }
    if (p.email) {
      html +=
        "<div><dt>ایمیل</dt><dd dir=\"ltr\">" + escapeHtml(p.email) + "</dd></div>";
    }
    if (p.amount) {
      html += "<div><dt>مبلغ</dt><dd>" + escapeHtml(p.amount) + "</dd></div>";
    }
    p.lines.forEach(function (row) {
      html +=
        "<div><dt>" +
        escapeHtml(row.k) +
        "</dt><dd>" +
        escapeHtml(row.v) +
        "</dd></div>";
    });
    html += "</dl>";
    return html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setTools(p) {
    var acceptBtn = modal.querySelector('[data-admin-action="accept"]');
    var rejectBtn = modal.querySelector('[data-admin-action="reject"]');
    var labels = {
      business: { accept: "تأیید فعال‌سازی", reject: "غیرفعال / رد" },
      claim: { accept: "پذیرش ادعا", reject: "رد درخواست" },
      invoice: { accept: "تأیید پرداخت", reject: "رد / لغو فاکتور" },
      manager: { accept: "تأیید حساب", reject: "رد / مسدودسازی" },
      link: { accept: "تأیید لینک", reject: "رد لینک" },
    };
    var L = labels[p.type] || { accept: "پذیرش", reject: "رد" };
    if (acceptBtn) {
      acceptBtn.textContent = p.type === "help" ? "متوجه شدم" : L.accept;
      acceptBtn.hidden = false;
    }
    if (rejectBtn) {
      rejectBtn.textContent = L.reject;
      rejectBtn.hidden = p.type === "help";
    }

    var gbpBtn = modal.querySelector('[data-admin-tool="gbp"]');
    if (gbpBtn) {
      gbpBtn.hidden = !p.gbpHref;
      gbpBtn.dataset.href = p.gbpHref || "";
    }
    var profBtn = modal.querySelector('[data-admin-tool="profile"]');
    if (profBtn) {
      profBtn.hidden = !p.profileHref;
      profBtn.dataset.href = p.profileHref || "";
    }
    var emBtn = modal.querySelector('[data-admin-tool="email"]');
    if (emBtn) emBtn.hidden = !p.email;
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  function openModal(payload) {
    currentPayload = payload;
    lastFocus = document.activeElement;
    typeEl.textContent = typeLabels[payload.type] || "جزئیات";
    titleEl.textContent = payload.title;
    bodyEl.innerHTML = renderBody(payload);
    noteEl.value = "";
    rejectEl.value = "";
    rejectWrap.hidden = false;
    setTools(payload);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    currentPayload = null;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".admin-detail-trigger");
    if (t) {
      e.preventDefault();
      openModal(readTrigger(t));
      return;
    }
    if (e.target.closest("[data-admin-detail-dismiss]")) {
      closeModal();
    }
  });

  closeBtn.addEventListener("click", closeModal);

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape" && !modal.hidden) {
        e.preventDefault();
        closeModal();
      }
    },
    true
  );

  modal.querySelectorAll("[data-admin-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-admin-action");
      var type = currentPayload ? currentPayload.type : "";
      if (action === "accept") {
        if (type === "help") {
          closeModal();
          return;
        }
        showToast(
          "پذیرفته شد (نمونه) — نوع: " +
            (typeLabels[type] || type) +
            " · «" +
            (currentPayload && currentPayload.title) +
            "»"
        );
        closeModal();
      } else if (action === "reject") {
        if (needsRejectReason(type) && !rejectEl.value.trim()) {
          rejectWrap.hidden = false;
          rejectEl.focus();
          showToast("لطفاً دلیل رد را بنویسید (نمونه).");
          return;
        }
        showToast(
          "رد / انصراف (نمونه) — «" +
            (currentPayload && currentPayload.title) +
            "»"
        );
        closeModal();
      }
    });
  });

  modal.querySelector('[data-admin-tool="note"]').addEventListener("click", function () {
    showToast("یادداشت ذخیره شد (نمونه — بدون سرور).");
  });

  modal.querySelector('[data-admin-tool="copy"]').addEventListener("click", function () {
    var id = currentPayload && currentPayload.id;
    if (!id) {
      showToast("شناسه‌ای برای کپی نیست.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(
        function () {
          showToast("شناسه در کلیپ‌بورد کپی شد.");
        },
        function () {
          showToast("کپی نشد؛ شناسه: " + id);
        }
      );
    } else {
      showToast("شناسه: " + id);
    }
  });

  modal.querySelector('[data-admin-tool="profile"]').addEventListener("click", function () {
    var h = this.dataset.href;
    if (h) window.open(h, "_blank", "noopener,noreferrer");
  });

  modal.querySelector('[data-admin-tool="gbp"]').addEventListener("click", function () {
    var h = this.dataset.href;
    if (h) window.open(h, "_blank", "noopener,noreferrer");
  });

  modal.querySelector('[data-admin-tool="email"]').addEventListener("click", function () {
    var em = currentPayload && currentPayload.email;
    if (em) window.location.href = "mailto:" + em;
    else showToast("ایمیلی ثبت نشده.");
  });

  modal.querySelector('[data-admin-tool="suspend"]').addEventListener("click", function () {
    showToast("وضعیت تعلیق (نمونه) ثبت شد.");
  });
})();
