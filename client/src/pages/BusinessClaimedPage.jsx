import { Link } from "react-router-dom";

export default function BusinessClaimedPage() {
  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      <h1>کلینیک پارس (نمونه ادعا شده)</h1>
      <p>
        <Link to="/listings">لیست</Link>
      </p>
    </main>
  );
}
