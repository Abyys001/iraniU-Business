import { Link } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext.jsx";
import DashboardPanelHead, { dashboardIcons } from "../../components/DashboardPanelHead.jsx";
import DashboardMain from "../../components/DashboardMain.jsx";

export default function DashboardPackagePage() {
  const { biz } = useDashboard();
  const pkgLabel = biz?.package === "featured" ? "ویژه" : biz?.package === "basic" ? "پایه" : "—";

  return (
    <DashboardMain>
      <section className="dashboard-panel" id="package" aria-labelledby="package-heading">
        <DashboardPanelHead headingId="package-heading" title="بسته تبلیغاتی" icon={dashboardIcons.package} />
        <p>
          بسته فعلی: <strong>{pkgLabel}</strong>
        </p>
        <div className="dashboard-actions dashboard-actions--inline">
          <Link className="btn btn--accent" to="/advertise">
            مشاهده و ارتقای بسته
          </Link>
        </div>
      </section>
    </DashboardMain>
  );
}
