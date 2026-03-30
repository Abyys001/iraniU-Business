/**
 * تنظیمات تلگرام: مقادیر ذخیره‌شده در app_meta با اولویت بر متغیرهای محیطی.
 * خالی گذاشتن در API (یا حذف از دیتابیس) → استفاده از .env در صورت وجود.
 */

import { db } from "./db.js";

export const META = {
  BOT_TOKEN: "telegram_settings_bot_token",
  CHAT_ID: "telegram_settings_chat_id",
  WEBHOOK_SECRET: "telegram_settings_webhook_secret",
  DIRECTORY_CHANNEL_ID: "telegram_settings_directory_channel_id",
  PUBLIC_SITE_URL: "telegram_settings_public_site_url",
};

function getStored(key) {
  const row = db.prepare(`SELECT value FROM app_meta WHERE key = ?`).get(key);
  if (!row) return undefined;
  return row.value != null ? String(row.value) : "";
}

function setStored(key, value) {
  const s = value === undefined || value === null ? "" : String(value).trim();
  if (s === "") {
    db.prepare(`DELETE FROM app_meta WHERE key = ?`).run(key);
  } else {
    db.prepare(`INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)`).run(key, s);
  }
}

/** مقادیر نهایی برای ارسال به API تلگرام */
export function getEffectiveTelegramConfig() {
  const botToken = (getStored(META.BOT_TOKEN) ?? process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (getStored(META.CHAT_ID) ?? process.env.TELEGRAM_CHAT_ID ?? "").trim();
  const webhookSecret = (getStored(META.WEBHOOK_SECRET) ?? process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim();
  const directoryChannelId = (
    getStored(META.DIRECTORY_CHANNEL_ID) ?? process.env.TELEGRAM_DIRECTORY_CHANNEL_ID ?? ""
  ).trim();
  const publicSiteUrl = (
    getStored(META.PUBLIC_SITE_URL) ?? process.env.PUBLIC_SITE_URL ?? process.env.SITE_BASE_URL ?? ""
  ).trim();
  return {
    botToken,
    chatId,
    webhookSecret,
    directoryChannelId,
    publicSiteUrl,
  };
}

export function maskSecret(s) {
  const t = String(s || "");
  if (!t) return null;
  if (t.length <= 4) return "••••";
  return `••••${t.slice(-4)}`;
}

function hasDbOverride(key) {
  return db.prepare(`SELECT 1 FROM app_meta WHERE key = ?`).get(key) != null;
}

/** پاسخ امن برای پنل سوپرادمین */
export function getTelegramConfigForAdmin() {
  const eff = getEffectiveTelegramConfig();
  return {
    telegram_configured: !!(eff.botToken && eff.chatId),
    kick_button_ready: !!(eff.botToken && eff.chatId && eff.webhookSecret),
    directory_channel_ready: !!(eff.botToken && eff.directoryChannelId),
    chat_id: eff.chatId,
    directory_channel_id: eff.directoryChannelId,
    public_site_url: eff.publicSiteUrl,
    bot_token_masked: maskSecret(eff.botToken),
    bot_token_set: !!eff.botToken,
    bot_token_source: hasDbOverride(META.BOT_TOKEN) ? "database" : "env",
    webhook_secret_set: !!eff.webhookSecret,
    webhook_secret_masked: maskSecret(eff.webhookSecret),
    webhook_secret_source: hasDbOverride(META.WEBHOOK_SECRET) ? "database" : "env",
  };
}

/**
 * PATCH: فقط کلیدهای ارسال‌شده به‌روز می‌شوند.
 * برای رمزها: رشتهٔ خالی = حذف از دیتابیس (برگشت به .env).
 */
export function applyTelegramConfigPatch(body) {
  const b = body && typeof body === "object" ? body : {};
  if ("bot_token" in b) setStored(META.BOT_TOKEN, b.bot_token);
  if ("chat_id" in b) setStored(META.CHAT_ID, b.chat_id);
  if ("webhook_secret" in b) setStored(META.WEBHOOK_SECRET, b.webhook_secret);
  if ("directory_channel_id" in b) setStored(META.DIRECTORY_CHANNEL_ID, b.directory_channel_id);
  if ("public_site_url" in b) setStored(META.PUBLIC_SITE_URL, b.public_site_url);
  return getTelegramConfigForAdmin();
}
