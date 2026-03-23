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
    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        const user = result.user || JSON.parse(localStorage.getItem("user"));

        if (user?.role === "volunteer") {
  navigate("/volunteer-dashboard");
} else if (user?.role === "organization") {
  navigate("/organization-dashboard");
} else if (user?.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/");
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
        <div className="heroInner">
          <div className="badge">Join AlokBortika</div>
          <h1 className="title">Sign up</h1>
          <p className="subtitle">Create an account to submit and follow progress.</p>

          <div className="card" style={{ maxWidth: 520 }}>
            {error ? <p className="messageError">{error}</p> : null}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Account Type</div>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="organization">Organization</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <button className="primary" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>

              <div className="authMeta">
                Already have an account?{" "}
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