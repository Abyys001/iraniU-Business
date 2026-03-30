import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../api.js";

export default function ManagerSignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    try {
      await apiPost("/api/managers", { email, name, phone });
      setMsg({ ok: true, text: "ثبت‌نام ذخیره شد. سوپرادمین می‌تواند در «لینک آگهی» شما را به آگهی وصل کند." });
      setEmail("");
      setName("");
      setPhone("");
    } catch (err) {
      const t = err.message || "";
      setMsg({
        ok: false,
        text: t.includes("email_taken") ? "این ایمیل قبلاً ثبت شده." : t,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="container" style={{ padding: "2rem 0", maxWidth: "32rem" }}>
      <h1>ثبت‌نام مدیر</h1>
      <p className="field-hint">برای مدیریت آگهی پس از تأیید سوپرادمین.</p>
      <form className="dashboard-panel" style={{ marginTop: "1rem" }} onSubmit={submit}>
        <div className="form-grid">
          <div className="field field--block">
            <label htmlFor="ms-email">ایمیل</label>
            <input
              id="ms-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              autoComplete="email"
            />
          </div>
          <div className="field field--block">
            <label htmlFor="ms-name">نام کامل</label>
            <input id="ms-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field field--block">
            <label htmlFor="ms-phone">تلفن</label>
            <input id="ms-phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
        </div>
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? "…" : "ثبت"}
        </button>
        {msg && (
          <p className="field-hint" style={{ color: msg.ok ? "inherit" : "#b71c1c" }}>
            {msg.text}
          </p>
        )}
      </form>
      <p style={{ marginTop: "1rem" }}>
        <Link to="/">خانه</Link>
      </p>
    </main>
  );
}
