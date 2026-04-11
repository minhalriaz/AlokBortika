import React, { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const tabs = [
  { key: "opportunities", label: "Volunteer Opportunities", path: "/admin" },
  { key: "organizations", label: "Manage Organizations", path: "/admin/organizations" },
  { key: "users", label: "Users & Roles", path: "/admin/users" },
];

const topRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  paddingBottom: "18px",
  borderBottom: "1px solid var(--border)",
};

const tabGroupStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
};

const pageIntroStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  paddingTop: "24px",
  marginBottom: "24px",
};

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
};

const spinStyle = {
  animation: "adminPageHeaderSpin 0.85s linear infinite",
};

function getTabStyle(isActive) {
  return {
    border: "1px solid transparent",
    borderRadius: "999px",
    padding: "12px 18px",
    background: isActive ? "#0f172a" : "rgba(148, 163, 184, 0.16)",
    color: isActive ? "#ffffff" : "var(--text)",
    fontSize: "0.95rem",
    fontWeight: isActive ? 800 : 700,
    boxShadow: isActive ? "0 14px 30px rgba(15, 23, 42, 0.22)" : "none",
    cursor: "pointer",
    transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease",
  };
}

function getButtonStyle(variant, disabled = false) {
  const shared = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "16px",
    padding: "12px 18px",
    fontSize: "0.95rem",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.72 : 1,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  };

  if (variant === "primary") {
    return {
      ...shared,
      border: "none",
      color: "#ffffff",
      background: "linear-gradient(135deg, #059669, #10b981)",
      boxShadow: "0 16px 30px rgba(16, 185, 129, 0.28)",
    };
  }

  if (variant === "danger") {
    return {
      ...shared,
      border: "1px solid rgba(248, 113, 113, 0.24)",
      color: "#b91c1c",
      background: "rgba(254, 226, 226, 0.88)",
    };
  }

  return {
    ...shared,
    border: "1px solid var(--border)",
    color: "var(--text)",
    background: "var(--surface)",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  };
}

export default function AdminPageHeader({ activeTab, title, description, action }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const ActionIcon = action?.icon || null;
  const actionVariant = action?.variant || "primary";

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      toast.success("Admin logged out.");
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes adminPageHeaderSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={topRowStyle}>
        <div style={tabGroupStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.path)}
              style={getTabStyle(activeTab === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={getButtonStyle("danger", loggingOut)}
        >
          {loggingOut ? <Loader2 size={16} style={spinStyle} /> : <LogOut size={16} />}
          {loggingOut ? "Logging out..." : "Admin Logout"}
        </button>
      </div>

      <div style={pageIntroStyle}>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "0.8rem",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#059669",
            }}
          >
            Admin Dashboard
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 2.6rem)", fontWeight: 800 }}>
            {title}
          </h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.6 }}>
            {description}
          </p>
        </div>

        {action ? (
          <div style={actionRowStyle}>
            <button
              type="button"
              onClick={action.onClick}
              disabled={Boolean(action.disabled)}
              style={getButtonStyle(actionVariant, Boolean(action.disabled))}
            >
              {ActionIcon ? <ActionIcon size={18} /> : null}
              {action.label}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
