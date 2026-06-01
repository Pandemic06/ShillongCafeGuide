import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Lazy-load the admin shell so the public bundle doesn't pay for TipTap / auth UI.
const AdminApp = lazy(() => import("./components/admin/AdminApp"));

const isAdminRoute = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdminRoute ? (
      <Suspense fallback={<div style={{ padding: 24, fontFamily: "sans-serif", color: "#666" }}>Loading admin…</div>}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
