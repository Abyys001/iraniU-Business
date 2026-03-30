/** قالب‌های رنگ چاپ QR نظر Google — باید با qr-print-template.css هم‌خوان باشد */

export const QR_THEME_MAX = 20;

/** رنگ ماژول‌های QR (تیره روشن) */
export const THEME_QR_COLORS = {
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

/** پس‌زمینهٔ تخت برای html2canvas (ریبون و نوار پایین) */
export const RIBBON_SOLID_BG = {
  1: "#3a0b47",
  2: "#0d5c63",
  3: "#8b6914",
  4: "#1e3a5f",
  5: "#7a1f3a",
  6: "#14532d",
  7: "#9a3412",
  8: "#3730a3",
  9: "#334155",
  10: "#9d174d",
  11: "#3f6212",
  12: "#0369a1",
  13: "#7f1d1d",
  14: "#6d28d9",
  15: "#b45309",
  16: "#0f766e",
  17: "#6b21a8",
  18: "#1e40af",
  19: "#be123c",
  20: "#164e63",
};

export const BODY_SOFT_BG = {
  1: "#faf5fc",
  2: "#e8f6f7",
  3: "#fbf6e8",
  4: "#eef3f9",
  5: "#fceef2",
  6: "#ecfdf5",
  7: "#fff7ed",
  8: "#eef2ff",
  9: "#f1f5f9",
  10: "#fdf2f8",
  11: "#f7fee7",
  12: "#e0f2fe",
  13: "#fef2f2",
  14: "#f5f3ff",
  15: "#fffbeb",
  16: "#ccfbf1",
  17: "#faf5ff",
  18: "#eff6ff",
  19: "#fff1f2",
  20: "#ecfeff",
};

export const ACCENT_MID_TEXT = {
  1: "#5c1f6e",
  2: "#128c96",
  3: "#c9a227",
  4: "#2d5a8f",
  5: "#b83d5e",
  6: "#166534",
  7: "#ea580c",
  8: "#4f46e5",
  9: "#64748b",
  10: "#db2777",
  11: "#65a30d",
  12: "#0284c7",
  13: "#b91c1c",
  14: "#8b5cf6",
  15: "#d97706",
  16: "#14b8a6",
  17: "#a855f7",
  18: "#3b82f6",
  19: "#f43f5e",
  20: "#0891b2",
};

export const QR_THEME_OPTIONS = [
  { value: "1", label: "۱ — بنفش برند ایرانیو" },
  { value: "2", label: "۲ — فیروزه‌ای" },
  { value: "3", label: "۳ — طلایی / کهربایی" },
  { value: "4", label: "۴ — سرمه‌ای" },
  { value: "5", label: "۵ — گل‌سرخی" },
  { value: "6", label: "۶ — سبز جنگلی" },
  { value: "7", label: "۷ — نارنجی" },
  { value: "8", label: "۸ — نیلی / ایندیگو" },
  { value: "9", label: "۹ — خاکستری تیره" },
  { value: "10", label: "۱۰ — سرخابی" },
  { value: "11", label: "۱۱ — سبز زیتونی / لیمویی" },
  { value: "12", label: "۱۲ — آبی آسمانی" },
  { value: "13", label: "۱۳ — زرشکی" },
  { value: "14", label: "۱۴ — بنفش روشن" },
  { value: "15", label: "۱۵ — کهربایی / آمبر" },
  { value: "16", label: "۱۶ — فیروزه‌ای نعنایی" },
  { value: "17", label: "۱۷ — آلوئی" },
  { value: "18", label: "۱۸ — آبی جین" },
  { value: "19", label: "۱۹ — مرجانی" },
  { value: "20", label: "۲۰ — فیروزه‌ای نیمه‌شب" },
];

export function clampThemeNum(n) {
  const t = parseInt(String(n), 10);
  if (!Number.isFinite(t)) return 1;
  return Math.min(QR_THEME_MAX, Math.max(1, t));
}

export function isValidStoredTheme(th) {
  const n = parseInt(String(th || ""), 10);
  return Number.isFinite(n) && n >= 1 && n <= QR_THEME_MAX;
}
