import { Link } from "react-router-dom";
import DashboardPanelHead, { dashboardIcons } from "../../components/DashboardPanelHead.jsx";
import DashboardMain from "../../components/DashboardMain.jsx";

export default function DashboardMediaPage() {
  return (
    <DashboardMain>
      <section className="dashboard-panel" id="media" aria-labelledby="media-heading">
        <DashboardPanelHead headingId="media-heading" title="تصاویر" icon={dashboardIcons.media} />
        <div className="form-grid">
          <div className="field field--block">
            <label htmlFor="dash-logo">لوگو (محلی — فقط پیش‌نمایش چاپ QR)</label>
            <input type="file" id="dash-logo" accept="image/*" />
          </div>
        </div>
        <p className="field-hint">
          کاور و گالریٔ صفحهٔ عمومی را در <Link to="/dashboard/edit">ویرایش آگهی</Link> با URL تنظیم کنید.
        </p>
      </section>
    </DashboardMain>
  );
}
