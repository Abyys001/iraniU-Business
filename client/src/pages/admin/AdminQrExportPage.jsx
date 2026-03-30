import { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { apiGet } from "../../api.js";
import html2canvas from "html2canvas";
import { clampThemeNum } from "../../data/qrPrintThemes.js";

function toBase64Url(str) {
  const b = btoa(unescape(encodeURIComponent(str)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sanitizeBid(raw) {
  let s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "business";
}

function buildGoUrl(googleReviewUrl, bid) {
  const u = new URL("/go", window.location.origin);
  u.searchParams.set("bid", sanitizeBid(bid));
  u.searchParams.set("t", toBase64Url(googleReviewUrl));
  return u.href;
}

function buildFlyerHtml(themeNum, name) {
  const t = clampThemeNum(themeNum);
  const safeName = (name || "نام کسب‌وکار").replace(/</g, "&lt;");
  return (
    `<div class="qr-tpl qr-tpl__sheet" data-qr-theme="${t}">` +
    `<div class="qr-tpl__frame">` +
    `<div class="qr-tpl__ribbon" dir="ltr" lang="en">` +
    `<span class="qr-tpl__deco qr-tpl__deco--tl" aria-hidden="true"></span>` +
    `<p class="qr-tpl__ribbon-title">Review us on Google</p>` +
    `<p class="qr-tpl__ribbon-sub">Scan the QR code to leave a review</p>` +
    `<span class="qr-tpl__deco qr-tpl__deco--br" aria-hidden="true"></span>` +
    `</div>` +
    `<div class="qr-tpl__body">` +
    `<div class="qr-tpl__logo qr-tpl__logo--empty"></div>` +
    `<div class="qr-tpl__qr"><canvas class="qr-tpl__qr-canvas" width="220" height="220" aria-hidden="true"></canvas></div>` +
    `<p class="qr-tpl__headline">از حمایت شما سپاسگزاریم</p>` +
    `<p class="qr-tpl__hint">با اسکن کد به صفحهٔ نظرات Google هدایت می‌شوید.</p>` +
    `<p class="qr-tpl__biz">${safeName}</p>` +
    `</div>` +
    `<div class="qr-tpl__strip">` +
    `<div class="qr-tpl__strip-url" dir="ltr" lang="en">www.iraniu.uk</div>` +
    `<div class="qr-tpl__strip-slogan" dir="rtl" lang="fa">فهرست کسب‌وکارهای ایرانی در بریتانیا</div>` +
    `</div>` +
    `</div></div>`
  );
}

async function waitForImages(root) {
  const imgs = root.querySelectorAll("img");
  await Promise.all(
    [...imgs].map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth !== 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    )
  );
  await Promise.all(
    [...imgs].map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))
  );
}

function patchFlyerCloneForCanvas(clonedRoot) {
  if (!clonedRoot) return;
  clonedRoot.style.fontFamily = '"Yekan Bakh", Tahoma, "Segoe UI", sans-serif';
  clonedRoot.style.direction = "rtl";
  clonedRoot.style.textAlign = "center";
  clonedRoot.style.color = "#1a1f24";
  clonedRoot.style.setProperty("-webkit-font-smoothing", "antialiased");
}

export default function AdminQrExportPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const generate = async () => {
    setBusy(true);
    setMsg("");
    try {
      const businesses = await apiGet("/api/businesses");
      const list = Array.isArray(businesses) ? businesses : [];
      if (!list.length) {
        setMsg("هیچ آگهی‌ای در پایگاه داده ثبت نشده است.");
        setBusy(false);
        return;
      }
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const pageMargin = 8;
      const gap = 4;
      const cellW = (pageW - pageMargin * 2 - gap) / 2;
      const cellH = (pageH - pageMargin * 2 - gap) / 2;
      let printedCount = 0;
      for (const b of list) {
        const reviewUrl = String(b.google_review_url || "").trim();
        const target =
          reviewUrl && reviewUrl.startsWith("http") ? buildGoUrl(reviewUrl, b.slug || b.name_fa || "business") : null;
        if (!target) continue;
        if (printedCount > 0 && printedCount % 4 === 0) {
          pdf.addPage();
        }

        const outer = document.createElement("div");
        outer.setAttribute("dir", "rtl");
        outer.setAttribute("lang", "fa");
        outer.className = "dashboard-qr-print-mount dashboard-qr-print-mount--pdf-capture dashboard-qr-pdf-root";
        outer.innerHTML = buildFlyerHtml("1", b.name_fa || b.slug || "");
        document.body.appendChild(outer);

        const el = outer.firstElementChild;
        if (!el) {
          if (outer.parentNode) outer.parentNode.removeChild(outer);
          continue;
        }

        const pdfQrCanvas = el.querySelector(".qr-tpl__qr-canvas");
        if (pdfQrCanvas) {
          await QRCode.toCanvas(pdfQrCanvas, target, {
            width: 220,
            margin: 2,
          });
        }

        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready.catch(() => {});
        }
        try {
          if (document.fonts?.load) {
            await Promise.all([
              document.fonts.load('400 1rem "Yekan Bakh"'),
              document.fonts.load('700 1.08rem "Yekan Bakh"'),
              document.fonts.load('800 1.2rem "Yekan Bakh"'),
            ]);
          }
        } catch (_) {
          /* ignore */
        }
        await waitForImages(outer);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise((r) => setTimeout(r, 120));

        const snap = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          foreignObjectRendering: false,
          imageTimeout: 15000,
          scrollX: 0,
          scrollY: 0,
          onclone: (_documentClone, referenceElement) => {
            const root =
              referenceElement?.classList?.contains?.("qr-tpl")
                ? referenceElement
                : referenceElement?.querySelector?.(".qr-tpl");
            if (root) patchFlyerCloneForCanvas(root);

            const liveCanvas = el.querySelector(".qr-tpl__qr-canvas");
            const clonedCanvas = referenceElement?.querySelector?.(".qr-tpl__qr-canvas");
            if (liveCanvas && clonedCanvas && liveCanvas.width && liveCanvas.height) {
              try {
                clonedCanvas.width = liveCanvas.width;
                clonedCanvas.height = liveCanvas.height;
                const ctx = clonedCanvas.getContext("2d");
                if (ctx) ctx.drawImage(liveCanvas, 0, 0);
              } catch (_) {
                /* ignore */
              }
            }
          },
        });

        const imgData = snap.toDataURL("image/png");
        const slot = printedCount % 4;
        const col = slot % 2;
        const row = Math.floor(slot / 2);
        const cellX = pageMargin + col * (cellW + gap);
        const cellY = pageMargin + row * (cellH + gap);
        const innerPad = 1.5;
        const maxW = cellW - innerPad * 2;
        const maxH = cellH - innerPad * 2;
        const iw = snap.width;
        const ih = snap.height;
        let w = maxW;
        let h = (ih * w) / iw;
        if (h > maxH) {
          h = maxH;
          w = (iw * h) / ih;
        }
        const x = cellX + (cellW - w) / 2;
        const y = cellY + (cellH - h) / 2;
        pdf.addImage(imgData, "PNG", x, y, w, h);
        printedCount += 1;

        if (outer.parentNode) outer.parentNode.removeChild(outer);
      }
      if (!printedCount) {
        setMsg("هیچ آگهی‌ای لینک نظر Google ثبت نکرده است، بنابراین QRی برای خروجی وجود ندارد.");
        setBusy(false);
        return;
      }
      pdf.save("iraniu-all-businesses-qr.pdf");
      setMsg(`فایل PDF ساخته شد (${printedCount} قالب QR، ۴ قالب در هر صفحه).`);
    } catch (e) {
      console.error(e);
      setMsg(e.message || "خطا در ساخت PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
      </p>
      <section className="dashboard-panel">
        <h2>خروجی PDF QR همه آگهی‌ها</h2>
        <p className="field-hint">
          این ابزار یک فایل PDF می‌سازد که در هر صفحهٔ A4 چهار قالب QR قرار می‌گیرد (۲×۲). برای هر کسب‌وکار باید در
          فیلد <strong>لینک صفحهٔ نظر Google</strong> مقدار ثبت شده باشد.
        </p>
        <div className="dashboard-actions">
          <button type="button" className="btn btn--primary" disabled={busy} onClick={generate}>
            {busy ? "در حال ساخت PDF…" : "دانلود PDF همه QRها"}
          </button>
        </div>
        {!!msg && <p className="field-hint" style={{ marginTop: "0.75rem" }}>{msg}</p>}
      </section>
    </>
  );
}

