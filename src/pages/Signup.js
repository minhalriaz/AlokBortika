import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
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

    if (formData.role === "organization") {
      navigate("/organization/register", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        const user = result.user || JSON.parse(localStorage.getItem("user") || "null");

        if (user?.role === "volunteer") {
          navigate("/volunteer-dashboard", { replace: true });
        } else if (user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(result.message || "Signup failed. Please try again.");
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
          <div className="badge">Join AlokBortika</div>
          <h1 className="title">Sign up</h1>
          <p className="subtitle">Create an admin, organizer, or volunteer account.</p>

          <div className="card authCard" style={{ maxWidth: 520 }}>
            {error ? <p className="messageError">{error}</p> : null}

            <form className="authForm" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Account type</div>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                  <option value="organization">Organizer / Organization</option>
                </select>
              </label>

              {formData.role === "organization" ? (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 16,
                    background: "rgba(15,118,110,0.05)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Organization registration has its own form.</div>
                  <div style={{ color: "var(--muted)", marginBottom: 12 }}>
                    Continue to the organizer registration page to submit your organization details.
                  </div>
                  <Link to="/organization/register" className="primary" style={{ display: "inline-block", textDecoration: "none" }}>
                    Open Organization Registration
                  </Link>
                </div>
              ) : (
                <>
                  <label>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Full name</div>
                    <input
                      className="input"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </label>

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
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <small style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 4 }}>
                      Password must be at least 6 characters long
                    </small>
                  </label>

                  <button className="primary" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : `Create ${formData.role} account`}
                  </button>
                </>
              )}

              <div className="authMeta">
                Already have an account? {" "}
                <Link to="/login" className="inlineLink">
                  Login
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
