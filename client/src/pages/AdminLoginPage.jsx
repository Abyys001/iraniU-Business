import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [err, setErr] = useState(null);
  const [pending, setPending] = useState(false);

  const redirectTo = params.get("redirect") || "/admin";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      await loginAdmin(email, password, totp.trim() || undefined);
      navigate(redirectTo, { replace: true });
    } catch (ex) {
      setErr(ex.message || "ورود ناموفق");
    } finally {
      setPending(false);
    }
  };

  return (
    <main id="main">
    <article className="section container" style={{ maxWidth: "26rem", padding: "2rem 1rem" }}>
      <h1 style={{ marginTop: 0 }}>ورود سوپرادمین</h1>
      <p className="field-hint">
        فقط برای مدیران کل سایت. رمز و در صورت فعال‌سازی، کد Google Authenticator لازم است.
      </p>
      <form onSubmit={onSubmit} className="form-grid" style={{ marginTop: "1rem" }}>
        <div className="field field--block">
          <label htmlFor="al-email">ایمیل</label>
          <input
            id="al-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="field field--block">
          <label htmlFor="al-pass">رمز عبور</label>
          <input
            id="al-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="field field--block">
          <label htmlFor="al-totp">کد Google Authenticator (در صورت فعال بودن)</label>
          <input
            id="al-totp"
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
        <Link to="/login">ورود مدیر کسب‌وکار</Link>
      </p>
    </article>
    </main>
  );
}
