/** ساختار ذخیرهٔ Biolink در businesses.biolink_json */

export const DEFAULT_BIOLINK = {
  headline: "",
  bio: "",
  /** URL تصویر پروفایل (اختیاری؛ در غیر این صورت از کاور آگهی می‌توان استفاده کرد) */
  avatarUrl: "",
  /** تم رنگ ۱…۱۰ (صفحهٔ عمومی) */
  themeId: 1,
  /** URL تصویر پس‌زمینهٔ تمام‌صفحه (اختیاری) */
  backgroundImageUrl: "",
  /** لایه روی تصویر: تیره ۵۰٪ / روشن ۳۰٪ یا بدون لایه */
  backgroundOverlay: "dark",
  /** نوار اعلان شیشه‌ای */
  alert: { enabled: false, text: "" },
  /** دکمه‌های اصلی (تمام‌عرض) */
  links: [],
  /** آیکن‌های کوچک در یک ردیف */
  socialLinks: [],
};

/** ۱۰ تم رنگ — مقادیر `--biolink-page-gradient` و حلقهٔ آواتار در CSS با `[data-biolink-theme]` */
export const BIOLINK_THEMES = [
  { id: 1, label: "فیروزه → بنفش", swatch: "linear-gradient(135deg, #2dd4bf, #6366f1, #5b21b6)" },
  { id: 2, label: "نارنجی → گل‌بهی", swatch: "linear-gradient(135deg, #fb923c, #f472b6, #7c3aed)" },
  { id: 3, label: "آبی اقیانوسی", swatch: "linear-gradient(180deg, #38bdf8, #2563eb, #1e3a8a)" },
  { id: 4, label: "سبز جنگلی", swatch: "linear-gradient(165deg, #34d399, #059669, #064e3b)" },
  { id: 5, label: "صورتی تیره", swatch: "linear-gradient(160deg, #f9a8d4, #db2777, #831843)" },
  { id: 6, label: "بنفش و سرخابی", swatch: "linear-gradient(150deg, #c084fc, #a855f7, #86198f)" },
  { id: 7, label: "خاکستری شب", swatch: "linear-gradient(180deg, #94a3b8, #475569, #0f172a)" },
  { id: 8, label: "کهربایی", swatch: "linear-gradient(165deg, #fcd34d, #d97706, #78350f)" },
  { id: 9, label: "فیروزه و آبی", swatch: "linear-gradient(180deg, #22d3ee, #0891b2, #164e63)" },
  { id: 10, label: "سبز لیمویی", swatch: "linear-gradient(155deg, #bef264, #65a30d, #365314)" },
];

export function clampThemeId(n) {
  const t = parseInt(String(n), 10);
  if (!Number.isFinite(t)) return 1;
  return Math.min(10, Math.max(1, t));
}

/** فقط URL امن برای پس‌زمینهٔ تصویری */
export function safeBackgroundImageUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https:\/\//i.test(s)) return s;
  if (/^http:\/\/localhost/i.test(s) || /^http:\/\/127\.0\.0\.1/i.test(s)) return s;
  return "";
}

export const BIOLINK_PRESETS = [
  { id: "custom", label: "لینک دلخواه", icon: "fa-solid fa-link", placeholder: "https://…" },
  { id: "phone", label: "تلفن", icon: "fa-solid fa-phone", placeholder: "+44… یا tel:…" },
  { id: "whatsapp", label: "واتساپ", icon: "fa-brands fa-whatsapp", placeholder: "https://wa.me/44…" },
  { id: "email", label: "ایمیل", icon: "fa-solid fa-envelope", placeholder: "mailto:…" },
  { id: "instagram", label: "اینستاگرام", icon: "fa-brands fa-instagram", placeholder: "https://instagram.com/…" },
  { id: "telegram", label: "تلگرام", icon: "fa-brands fa-telegram", placeholder: "https://t.me/…" },
  { id: "twitter", label: "X / توییتر", icon: "fa-brands fa-x-twitter", placeholder: "https://x.com/…" },
  { id: "facebook", label: "فیسبوک", icon: "fa-brands fa-facebook", placeholder: "https://facebook.com/…" },
  { id: "messenger", label: "Messenger", icon: "fa-brands fa-facebook-messenger", placeholder: "https://m.me/…" },
  { id: "linkedin", label: "لینکدین", icon: "fa-brands fa-linkedin-in", placeholder: "https://linkedin.com/…" },
  { id: "youtube", label: "یوتیوب", icon: "fa-brands fa-youtube", placeholder: "https://youtube.com/…" },
  { id: "tiktok", label: "تیک‌تاک", icon: "fa-brands fa-tiktok", placeholder: "https://tiktok.com/…" },
  { id: "discord", label: "Discord", icon: "fa-brands fa-discord", placeholder: "https://discord.gg/…" },
  { id: "google", label: "Google / Maps", icon: "fa-brands fa-google", placeholder: "https://maps.google.com/…" },
  { id: "website", label: "وب‌سایت", icon: "fa-solid fa-globe", placeholder: "https://…" },
];

/** پیش‌فرض‌های پیشنهادی برای ردیف آیکن‌های اجتماعی */
export const SOCIAL_BAR_PRESET_IDS = [
  "phone",
  "telegram",
  "whatsapp",
  "facebook",
  "messenger",
  "instagram",
  "discord",
];

export function parseBiolinkJson(raw) {
  if (!raw || typeof raw !== "string") return normalizeBiolink({});
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return normalizeBiolink({});
    return normalizeBiolink(o);
  } catch {
    return normalizeBiolink({});
  }
}

function normalizeBiolink(o) {
  const alertRaw = o.alert && typeof o.alert === "object" ? o.alert : {};
  const ov = String(o.backgroundOverlay ?? "dark").toLowerCase();
  const overlay = ov === "light" || ov === "none" ? ov : "dark";
  return {
    headline: String(o.headline ?? ""),
    bio: String(o.bio ?? ""),
    avatarUrl: String(o.avatarUrl ?? ""),
    themeId: clampThemeId(o.themeId),
    backgroundImageUrl: String(o.backgroundImageUrl ?? ""),
    backgroundOverlay: overlay,
    alert: {
      enabled: !!(alertRaw.enabled === true || alertRaw.enabled === 1 || alertRaw.enabled === "1"),
      text: String(alertRaw.text ?? ""),
    },
    links: Array.isArray(o.links) ? o.links.filter(Boolean) : [],
    socialLinks: Array.isArray(o.socialLinks) ? o.socialLinks.filter(Boolean) : [],
  };
}

export function stringifyBiolink(data) {
  const ov = String(data.backgroundOverlay ?? "dark").toLowerCase();
  const overlay = ov === "light" || ov === "none" ? ov : "dark";
  const o = {
    headline: String(data.headline ?? "").trim(),
    bio: String(data.bio ?? "").trim(),
    avatarUrl: String(data.avatarUrl ?? "").trim(),
    themeId: clampThemeId(data.themeId),
    backgroundImageUrl: String(data.backgroundImageUrl ?? "").trim(),
    backgroundOverlay: overlay,
    alert: {
      enabled: !!(data.alert && data.alert.enabled),
      text: String(data.alert?.text ?? "").trim(),
    },
    links: Array.isArray(data.links) ? data.links : [],
    socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
  };
  return JSON.stringify(o);
}

export function newLinkId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `l-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyLink(presetId = "custom") {
  const p = BIOLINK_PRESETS.find((x) => x.id === presetId) || BIOLINK_PRESETS[0];
  return {
    id: newLinkId(),
    preset: p.id,
    label: p.label,
    url: "",
    iconClass: p.icon,
    enabled: true,
  };
}

export function createEmptySocialLink(presetId = "phone") {
  const p = BIOLINK_PRESETS.find((x) => x.id === presetId) || BIOLINK_PRESETS[0];
  return {
    id: newLinkId(),
    preset: p.id,
    url: "",
    iconClass: p.icon,
    enabled: true,
  };
}

/** آدرس نهایی برای تگ <a> — تلفن، واتساپ و ایمیل را در صورت نیاز نرمال می‌کند */
export function resolveBiolinkHref(link) {
  if (!link || typeof link !== "object") return "#";
  const preset = String(link.preset || "custom");
  let u = String(link.url || "").trim();
  if (!u) return "#";
  if (preset === "phone") {
    if (u.startsWith("tel:")) return u;
    const digits = u.replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : u;
  }
  if (preset === "whatsapp") {
    if (/^https?:\/\//i.test(u)) return u;
    const digits = u.replace(/[^\d]/g, "");
    if (!digits) return u;
    const intl = digits.startsWith("0") ? digits.replace(/^0+/, "") : digits;
    return `https://wa.me/${intl.replace(/^\+/, "")}`;
  }
  if (preset === "email" && !/^mailto:/i.test(u)) {
    return `mailto:${u}`;
  }
  return u;
}

export function iconForPreset(presetId) {
  const p = BIOLINK_PRESETS.find((x) => x.id === presetId);
  return p ? p.icon : "fa-solid fa-link";
}

export function labelForPreset(presetId) {
  const p = BIOLINK_PRESETS.find((x) => x.id === presetId);
  return p ? p.label : "شبکه اجتماعی";
}
