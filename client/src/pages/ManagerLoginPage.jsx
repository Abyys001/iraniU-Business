import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ManagerLoginPage() {
  const { loginManager } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [err, setErr] = useState(null);
  const [pending, setPending] = useState(false);

  const redirectTo = params.get("redirect") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      await loginManager(email, password, totp.trim() || undefined);
      try {
        const raw = sessionStorage.getItem("iraniu_dashboard_business_slug");
        if (!raw) {
          const t = sessionStorage.getItem("iraniu_jwt");
          const r = await fetch("/api/auth/me", {
            headers: t ? { Authorization: `Bearer ${t}` } : {},
            credentials: "include",
          });
          if (r.ok) {
            const m = await r.json();
            const first = m.user?.linked_businesses?.[0]?.slug;
            if (first) localStorage.setItem("iraniu_dashboard_business_slug", first);
          }
        }
      } catch (_) {}
      navigate(redirectTo, { replace: true });
    } catch (ex) {
      setErr(ex.message || "ورود ناموفق");
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="section container" style={{ maxWidth: "26rem", padding: "2rem 1rem" }}>
      <h1 style={{ marginTop: 0 }}>ورود مدیر کسب‌وکار</h1>
      <p className="field-hint">
        با ایمیل و رمزی که سوپرادمین برای شما ثبت کرده وارد شوید. اگر Google Authenticator فعال است، کد ۶ رقمی را هم
        وارد کنید.
      </p>
      <form onSubmit={onSubmit} className="form-grid" style={{ marginTop: "1rem" }}>
        <div className="field field--block">
          <label htmlFor="ml-email">ایمیل</label>
          <input
            id="ml-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="field field--block">
          <label htmlFor="ml-pass">رمز عبور</label>
          <input
            id="ml-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="field field--block">
          <label htmlFor="ml-totp">کد Google Authenticator (در صورت فعال بودن)</label>
          <input
            id="ml-totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="۶ رقم"
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            dir="ltr"
          />
        </div>
        {err && <p className="field-hint" style={{ color: "#b71c1c" }}>{err}</p>}
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "در حال ورود…" : "ورود"}
        </button>
      </form>
      <p className="field-hint" style={{ marginTop: "1.25rem" }}>
        <Link to="/">بازگشت به خانه</Link>
        {" · "}
        <Link to="/admin/login">ورود سوپرادمین</Link>
      </p>
    </article>
  );
}
