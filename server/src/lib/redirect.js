/** Decode base64url payload used in ?t= (Node + browser) */

export function base64UrlToString(s) {
  if (!s) return null;
  try {
    let pad = s.length % 4;
    let b = s;
    if (pad) b += "=".repeat(4 - pad);
    b = b.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof Buffer !== "undefined") {
      return Buffer.from(b, "base64").toString("utf8");
    }
    const bin = atob(b);
    try {
      return decodeURIComponent(
        Array.from(bin, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
    } catch {
      return bin;
    }
  } catch {
    return null;
  }
}

export function safeGoogleReviewUrl(url) {
  if (!url || typeof url !== "string") return null;
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase();
  const ok =
    host.includes("google.") ||
    host === "g.page" ||
    host === "goo.gl" ||
    host === "maps.app.goo.gl" ||
    host.endsWith(".g.page");
  if (!ok) return null;
  if (u.protocol === "http:") u.protocol = "https:";
  return u.href;
}

/** Any normal https (or http→https) URL — for dev / demo QR targets when Google-only is too strict */
export function safeHttpsRedirectUrl(url) {
  if (!url || typeof url !== "string") return null;
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (!u.hostname) return null;
  if (u.protocol === "http:") u.protocol = "https:";
  return u.href;
}

/**
 * Resolve redirect target: Google Maps/review links always allowed.
 * Other https URLs only when NODE_ENV !== "production" or ALLOW_ANY_REVIEW_REDIRECT=1.
 */
export function resolveReviewRedirectUrl(decoded, opts = {}) {
  const loose = opts.loose === true;
  const google = safeGoogleReviewUrl(decoded);
  if (google) return google;
  if (loose) return safeHttpsRedirectUrl(decoded);
  return null;
}

export function sanitizeBid(raw) {
  let s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "business";
}
