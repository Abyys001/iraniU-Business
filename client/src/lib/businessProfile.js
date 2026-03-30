/** Default ساعات کاری when DB empty */
export const DEFAULT_HOURS_ROWS = [
  { day: "شنبه", hours: "۱۲:۰۰–۲۳:۰۰" },
  { day: "یکشنبه", hours: "۱۲:۰۰–۲۲:۰۰" },
  { day: "دوشنبه", hours: "۱۲:۰۰–۲۳:۰۰" },
  { day: "سه‌شنبه", hours: "۱۲:۰۰–۲۳:۰۰" },
  { day: "چهارشنبه", hours: "۱۲:۰۰–۲۳:۰۰" },
  { day: "پنج‌شنبه", hours: "۱۲:۰۰–۲۳:۰۰" },
  { day: "جمعه", hours: "۱۴:۰۰–۲۳:۰۰" },
];

export function parseHoursJson(json) {
  if (!json || typeof json !== "string") return [...DEFAULT_HOURS_ROWS];
  try {
    const a = JSON.parse(json);
    if (!Array.isArray(a)) return [...DEFAULT_HOURS_ROWS];
    const out = a
      .filter((x) => x && typeof x.day === "string")
      .map((x) => ({
        day: String(x.day),
        hours: x.hours != null ? String(x.hours) : "",
      }));
    return out.length ? out : [...DEFAULT_HOURS_ROWS];
  } catch {
    return [...DEFAULT_HOURS_ROWS];
  }
}

export function parseGalleryJson(json) {
  if (!json || typeof json !== "string") return ["", "", "", ""];
  try {
    const a = JSON.parse(json);
    if (!Array.isArray(a)) return ["", "", "", ""];
    const urls = a.map((x) => (x == null ? "" : String(x).trim())).slice(0, 4);
    while (urls.length < 4) urls.push("");
    return urls;
  } catch {
    return ["", "", "", ""];
  }
}

/**
 * تبدیل لینک تصویر به آدرس قابل نمایش در مرورگر (https، مسیر نسبی از ریشهٔ سایت، یا //).
 */
export function resolveBusinessImageUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) {
    if (typeof window !== "undefined" && window.location?.protocol) {
      return `${window.location.protocol}${s}`;
    }
    return `https:${s}`;
  }
  if (s.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${s}`;
    }
    return s;
  }
  return s;
}

/** اولویت: کاور سفارشی، سپس اولین تصویر گالری با URL پر */
export function pickHeroImageUrlFromBusiness(b) {
  if (!b || typeof b !== "object") return "";
  const cover = String(b.cover_image_url ?? "").trim();
  if (cover) return cover;
  const slots = parseGalleryJson(b.gallery_json);
  const first = slots.map((u) => String(u ?? "").trim()).find(Boolean);
  return first || "";
}
