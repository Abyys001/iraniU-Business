import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api.js";
import { parseBiolinkJson } from "../lib/biolink.js";
import BiolinkPublicView from "../components/BiolinkPublicView.jsx";

const BASE_TITLE = "ایرانیو";

export default function BiolinkPublicPage() {
  const { slug } = useParams();
  const [biz, setBiz] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    document.body.classList.add("biolink-public-body");
    return () => document.body.classList.remove("biolink-public-body");
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setErr(null);
    setBiz(null);
    apiGet(`/api/businesses/${encodeURIComponent(slug)}`)
      .then((b) => {
        if (!cancelled) setBiz(b);
      })
      .catch(() => {
        if (!cancelled) setErr("not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      document.title = BASE_TITLE;
      return;
    }
    if (err) {
      document.title = `صفحه یافت نشد · ${BASE_TITLE}`;
      return () => {
        document.title = BASE_TITLE;
      };
    }
    if (!biz) {
      document.title = `${BASE_TITLE}`;
      return;
    }
    const bl = parseBiolinkJson(biz.biolink_json);
    const pageTitle = (bl.headline || biz.name_fa || "").trim() || "—";
    const t = pageTitle && pageTitle !== "—" ? `${pageTitle} · ${BASE_TITLE}` : BASE_TITLE;
    document.title = t;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [slug, err, biz]);

  if (!slug) {
    return (
      <div className="biolink-public biolink-public--center">
        <p>آدرس نامعتبر است.</p>
        <Link to="/listings">بازگشت به فهرست</Link>
      </div>
    );
  }

  if (err) {
    return (
      <div className="biolink-public biolink-public--center">
        <p>این صفحه یافت نشد.</p>
        <Link to="/listings">بازگشت به فهرست</Link>
      </div>
    );
  }

  if (biz === null) {
    return (
      <div className="biolink-public biolink-public--center">
        <p>در حال بارگذاری…</p>
      </div>
    );
  }

  const data = parseBiolinkJson(biz.biolink_json);
  return (
    <BiolinkPublicView
      slug={slug}
      businessName={biz.name_fa || ""}
      coverFallback={biz.cover_image_url || ""}
      data={data}
    />
  );
}
