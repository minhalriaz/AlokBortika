import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accountType: "volunteer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.accountType === "organization") {
      navigate("/organization/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message || "Login failed. Please check your credentials.");
        return;
      }

      const user = result.user;

      if (formData.accountType !== user?.role) {
        setError(`This account is registered as ${user?.role || "another role"}. Please choose the correct login type.`);
        return;
      }

      if (user?.role === "volunteer") {
        navigate("/volunteer-dashboard", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner authShell">
          <div className="badge">Welcome Back</div>
          <h1 className="title">Login</h1>
          <p className="subtitle">Sign in as an admin, organizer, or volunteer.</p>

          <div className="card authCard" style={{ maxWidth: 520 }}>
            {error ? <p className="messageError">{error}</p> : null}

            <form className="authForm" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Login type</div>
                <select
                  className="input"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                  <option value="organization">Organizer / Organization</option>
                </select>
              </label>

              {formData.accountType === "organization" ? (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 16,
                    background: "rgba(15,118,110,0.05)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Organization accounts use a separate portal.</div>
                  <div style={{ color: "var(--muted)", marginBottom: 12 }}>
                    Use the organization login page to access the organizer dashboard.
                  </div>
                  <Link to="/organization/login" className="primary" style={{ display: "inline-block", textDecoration: "none" }}>
                    Go to Organization Login
                  </Link>
                </div>
              ) : (
                <>
                  <label>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
                    <input
                      className="input"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </label>

                  <label>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Password</div>
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

                  <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
                    <Link
                      to="/forgot-password"
                      className="inlineLink"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button className="primary" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : `Login as ${formData.accountType}`}
                  </button>
                </>
              )}

              <div className="authMeta">
                Need a volunteer or admin account? {" "}
                <Link to="/signup" className="inlineLink">
                  Sign up
                </Link>
              </div>

              <div className="authMeta">
                Need an organization account? {" "}
                <Link to="/organization/register" className="inlineLink">
                  Register organization
                </Link>
              </div>

              <div style={{ marginTop: 6 }}>
                <Link to="/" className="inlineLink">
                  {"<- Back to home"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
