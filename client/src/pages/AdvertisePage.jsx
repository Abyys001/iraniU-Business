import { Link } from "react-router-dom";

export default function AdvertisePage() {
  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <h1>تبلیغات و بسته‌ها</h1>
          <p>بسته مناسب را انتخاب کنید.</p>
          <p>
            <Link className="btn btn--primary" to="/onboarding" style={{ marginInlineEnd: "0.5rem" }}>
              ثبت رایگان در فهرست
            </Link>
            <Link to="/dashboard">پنل کسب‌وکار</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
