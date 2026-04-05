import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";
import "../App.css";

export default function OrganizationLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/organization/login", formData);

      if (res.data.success) {
        const org = res.data.organization;

        // Store org token and data
        if (res.data.token) {
          localStorage.setItem("orgToken", res.data.token);
        }
        localStorage.setItem("organization", JSON.stringify(org));

        if (org.status === "pending") {
          setError("Your organization is awaiting admin approval. You'll be notified once approved.");
          setLoading(false);
          return;
        }

        navigate("/organization-dashboard", { replace: true });
      } else {
        setError(res.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      {/* Navbar */}
      <nav className="nav">
        <div className="brand">
          <div className="brandMark">
            <div className="brandMarkDot" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--accent-strong)" }}>
            AlokBortika
          </span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/login" style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 600 }}>
            Volunteer Login
          </Link>
          <Link to="/organization/register" className="primary" style={{
            padding: "8px 18px", borderRadius: "999px", background: "var(--accent)",
            color: "white", fontWeight: 700, fontSize: "0.88rem"
          }}>
            Register Org
          </Link>
        </div>
      </nav>

      <div className="hero" style={{ minHeight: "calc(100vh - 70px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 560, padding: "0 1rem" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(15,118,110,0.1)", color: "var(--accent)",
              padding: "6px 16px", borderRadius: "999px", fontSize: "0.82rem",
              fontWeight: 700, marginBottom: "1rem", border: "1px solid rgba(15,118,110,0.2)"
            }}>
              🏢 Organization Portal
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
              Organization Login
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
              Sign in to manage your organization, volunteers & problems.
            </p>
          </div>

          {/* Form Card */}
          <div className="card authCard" style={{ padding: "2rem" }}>
            {error && (
              <div style={{
                background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
                borderRadius: "12px", padding: "12px 16px", color: "#dc2626",
                marginBottom: "1.25rem", fontSize: "0.9rem", fontWeight: 600
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.9rem", color: "var(--text)" }}>
                  Organization Email
                </div>
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="org@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.9rem", color: "var(--text)" }}>
                  Password
                </div>
                <input
                  className="input"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>

              <button
                className="primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: "0.5rem", padding: "12px", fontSize: "1rem", fontWeight: 700 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                      animation: "spin 0.7s linear infinite", display: "inline-block"
                    }} />
                    Logging in...
                  </span>
                ) : "Login as Organization"}
              </button>

              <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.88rem" }}>
                Don't have an account?{" "}
                <Link to="/organization/register" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  Register your organization
                </Link>
              </div>

              <div style={{ textAlign: "center" }}>
                <Link to="/" style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  ← Back to home
                </Link>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div style={{
            marginTop: "1.5rem", padding: "1rem 1.25rem",
            background: "rgba(15,118,110,0.06)", borderRadius: "14px",
            border: "1px solid rgba(15,118,110,0.15)"
          }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>
              🔒 Are you a volunteer?{" "}
              <Link to="/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
