import { parseAuthHeader } from "./authUtil.js";

export function requireSuperAdmin(req, res, next) {
  const p = parseAuthHeader(req);
  if (!p || p.typ !== "adm") {
    return res.status(401).json({ error: "unauthorized", hint: "ورود سوپرادمین لازم است" });
  }
  req.auth = p;
  next();
}

export function requireManager(req, res, next) {
  const p = parseAuthHeader(req);
  if (!p || p.typ !== "mgr") {
    return res.status(401).json({ error: "unauthorized", hint: "ورود مدیر لازم است" });
  }
  req.auth = p;
  next();
}

/** هر دو نقش */
export function requireManagerOrSuperAdmin(req, res, next) {
  const p = parseAuthHeader(req);
  if (!p || (p.typ !== "mgr" && p.typ !== "adm")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  req.auth = p;
  next();
}
