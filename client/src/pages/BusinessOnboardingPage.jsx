import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api.js";
import { DEFAULT_HOURS_ROWS } from "../lib/businessProfile.js";

const STEPS = [
  { id: "identity", title: "نام و نامک" },
  { id: "contact", title: "تماس و مکان" },
  { id: "profile", title: "معرفی و لینک‌ها" },
  { id: "review", title: "ثبت" },
];

function slugPatternOk(s) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

export default function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [slug, setSlug] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [description, setDescription] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [cta, setCta] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const canGoNext = () => {
    if (step === 0) {
      const s = slug.trim().toLowerCase();
      return s.length > 0 && nameFa.trim().length > 0 && slugPatternOk(s);
    }
    return true;
  };

  const next = () => {
    setMsg(null);
    if (!canGoNext()) {
      setMsg({
        ok: false,
        text: "نامک فقط با حروف انگلیسی کوچک، اعداد و خط تیره است (مثلاً my-cafe-london).",
      });
      return;
    }
    setStep((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const back = () => {
    setMsg(null);
    setStep((i) => Math.max(i - 1, 0));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const s = slug.trim().toLowerCase();
    if (!slugPatternOk(s) || !nameFa.trim()) {
      setMsg({ ok: false, text: "نام و نامک را درست پر کنید." });
      setSaving(false);
      return;
    }
    const hours_json = JSON.stringify(
      DEFAULT_HOURS_ROWS.map((r) => ({ day: r.day, hours: r.hours }))
    );
    const gallery_json = JSON.stringify(["", "", "", ""]);
    const payload = {
      slug: s,
      name_fa: nameFa.trim(),
      description: description.trim(),
      category: category.trim(),
      city: city.trim(),
      phone: phone.trim(),
      address: address.trim(),
      google_review_url: googleReviewUrl.trim(),
      listing_title: listingTitle.trim(),
      cta: cta.trim(),
      price_range: priceRange.trim(),
      hours_json,
      gallery_json,
      status: "active",
    };
    try {
      await apiPost("/api/businesses", payload);
      navigate(`/business?slug=${encodeURIComponent(s)}`, {
        state: { onboardingComplete: true },
      });
    } catch (err) {
      const t = String(err.message || "");
      let text = t;
      if (t.includes("slug_taken")) text = "این نامک قبلاً گرفته شده؛ نامک دیگری انتخاب کنید.";
      else if (t.includes("invalid_slug")) text = "فرمت نامک نامعتبر است.";
      else if (t.includes("missing_slug_or_name")) text = "نامک و نام کسب‌وکار الزامی است.";
      else if (t.includes("invalid_json_field")) text = "خطا در دادهٔ ساختاری؛ دوباره تلاش کنید.";
      setMsg({ ok: false, text });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container onboarding-page" style={{ padding: "2rem 0", maxWidth: "40rem" }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ margin: "0 0 0.35rem" }}>ثبت کسب‌وکار</h1>
        <p className="field-hint" style={{ margin: 0 }}>
          چند مرحلهٔ کوتاه؛ آگهی شما با بستهٔ پایه و بدون مالک ثبت می‌شود. بعداً می‌توانید از همان صفحهٔ آگهی{" "}
          <strong>ادعای مالکیت</strong> کنید یا برای بستهٔ ویژه به{" "}
          <Link to="/advertise">تبلیغات</Link> سر بزنید.
        </p>
      </header>

      <ol className="onboarding-steps" aria-label="مراحل ثبت">
        {STEPS.map((st, i) => (
          <li
            key={st.id}
            className={
              "onboarding-steps__item" +
              (i === step ? " onboarding-steps__item--active" : "") +
              (i < step ? " onboarding-steps__item--done" : "")
            }
          >
            <span className="onboarding-steps__num" aria-hidden="true">
              {i + 1}
            </span>
            {st.title}
          </li>
        ))}
      </ol>

      <form className="dashboard-panel" onSubmit={step === STEPS.length - 1 ? submit : (e) => e.preventDefault()}>
        {step === 0 && (
          <>
            <h2 className="onboarding-panel-title">نام نمایشی و آدرس اینترنتی</h2>
            <p className="field-hint" style={{ marginTop: 0 }}>
              نامک در آدرس سایت دیده می‌شود و بعد از ثبت به‌سادگی عوض نمی‌شود.
            </p>
            <div className="form-grid">
              <div className="field field--block">
                <label htmlFor="onb-slug">نامک (انگلیسی)</label>
                <input
                  id="onb-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  lang="en"
                  dir="ltr"
                  autoComplete="off"
                  placeholder="my-business-london"
                  required
                />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-name">نام کسب‌وکار (فارسی)</label>
                <input id="onb-name" value={nameFa} onChange={(e) => setNameFa(e.target.value)} required />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="onboarding-panel-title">تماس و مکان</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="onb-city">شهر</label>
                <input id="onb-city" value={city} onChange={(e) => setCity(e.target.value)} lang="en" dir="ltr" />
              </div>
              <div className="field">
                <label htmlFor="onb-phone">تلفن</label>
                <input id="onb-phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-address">آدرس کامل</label>
                <textarea id="onb-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="onboarding-panel-title">معرفی و لینک‌ها</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="onb-cat">دسته (مثلاً رستوران، کلینیک)</label>
                <input id="onb-cat" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="onb-price">محدودهٔ قیمت (اختیاری)</label>
                <input
                  id="onb-price"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  dir="ltr"
                  placeholder="£10–25"
                />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-list-title">عنوان کوتاه در لیست</label>
                <input
                  id="onb-list-title"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  placeholder="مثلاً غذای خانگی ایرانی در منچستر"
                />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-desc">توضیحات</label>
                <textarea
                  id="onb-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="خدمات، ویژگی‌ها، محله…"
                />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-greview">لینک صفحهٔ نظر Google (اختیاری)</label>
                <input
                  id="onb-greview"
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://g.page/.../review"
                />
              </div>
              <div className="field field--block">
                <label htmlFor="onb-cta">دکمهٔ فراخوان (اختیاری)</label>
                <input
                  id="onb-cta"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="مثلاً رزرو، تماس، وب‌سایت"
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="onboarding-panel-title">جمع‌بندی</h2>
            <dl className="onboarding-summary">
              <div>
                <dt>نامک</dt>
                <dd lang="en" dir="ltr">
                  {slug.trim().toLowerCase() || "—"}
                </dd>
              </div>
              <div>
                <dt>نام</dt>
                <dd>{nameFa.trim() || "—"}</dd>
              </div>
              <div>
                <dt>شهر / تلفن</dt>
                <dd>
                  {[city.trim(), phone.trim()].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
              <div>
                <dt>دسته</dt>
                <dd>{category.trim() || "—"}</dd>
              </div>
            </dl>
            <p className="field-hint">
              با زدن ثبت، آگهی در فهرست عمومی نمایش داده می‌شود (مگر بعداً وضعیت را غیرفعال کنید). برای مدیریت
              پیشرفته بعداً می‌توانید از <Link to="/dashboard">پنل کسب‌وکار</Link> استفاده کنید.
            </p>
          </>
        )}

        {msg && !msg.ok && (
          <p className="field-hint" role="alert" style={{ color: "var(--color-danger, #b00020)" }}>
            {msg.text}
          </p>
        )}

        <div className="dashboard-actions dashboard-actions--inline" style={{ borderTop: "none" }}>
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={back} disabled={saving}>
              قبلی
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button type="button" className="btn btn--primary" onClick={next}>
              بعدی
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "در حال ثبت…" : "ثبت آگهی"}
            </button>
          )}
        </div>
      </form>

      <p className="field-hint" style={{ marginTop: "1rem" }}>
        <Link to="/listings">بازگشت به فهرست</Link>
        {" · "}
        <Link to="/">خانه</Link>
      </p>
    </div>
  );
}
