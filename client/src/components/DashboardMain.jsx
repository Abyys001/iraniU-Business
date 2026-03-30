/** قالب یکدست برای صفحات فرعی داشبورد */
export default function DashboardMain({ children }) {
  return (
    <div className="dashboard-wrap">
      <div className="dashboard">
        <aside className="dashboard-sidebar" aria-hidden="true" />
        <div className="dashboard-main">{children}</div>
      </div>
    </div>
  );
}
