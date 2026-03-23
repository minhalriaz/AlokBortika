import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, subtitle, children, role = "volunteer" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const profileRoute =
    role === "volunteer"
      ? "/volunteer-profile"
      : role === "organization"
      ? "/organization-dashboard"
      : "/admin-dashboard";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(80,120,255,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(0,200,150,0.18), transparent 25%), #0f172a",
        color: "#e5e7eb",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(15,23,42,0.75)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1 }}>ALOKBORTIKA</div>
            <h1 style={{ margin: 0, fontSize: 24 }}>{title}</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>{subtitle}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{user?.email || ""}</div>
            </div>

            <Link
              to={profileRoute}
              style={{
                textDecoration: "none",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#ef4444",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>{children}</main>
    </div>
  );
}