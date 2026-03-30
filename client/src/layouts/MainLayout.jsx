import { Outlet } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import DesktopGate from "../components/DesktopGate.jsx";

export default function MainLayout() {
  return (
    <>
      <DesktopGate />
      <a className="skip-link" href="#main">
        پرش به محتوا
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
