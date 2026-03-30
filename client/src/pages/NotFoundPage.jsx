import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="container" style={{ padding: "3rem 0", textAlign: "center" }}>
      <h1>۴۰۴</h1>
      <p>صفحه پیدا نشد.</p>
      <Link to="/">خانه</Link>
    </main>
  );
}
