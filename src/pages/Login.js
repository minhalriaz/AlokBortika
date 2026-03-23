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
      const result = await login(formData);

      console.log("login result:", result);
      console.log("login user:", result.user);

      if (result.success) {
        const user = result.user;

        if (user?.role === "volunteer") {
          navigate("/volunteer-dashboard", { replace: true });
        } else if (user?.role === "organization") {
          navigate("/organization-dashboard", { replace: true });
        } else if (user?.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(result.message || "Login failed. Please check your credentials.");
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
          <div className="badge">Welcome Back</div>
          <h1 className="title">Login</h1>
          <p className="subtitle">Sign in to your AlokBortika account.</p>

          <div className="card" style={{ maxWidth: 520 }}>
            {error ? <p className="messageError">{error}</p> : null}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="authMeta">
                Don't have an account?{" "}
                <Link to="/signup" className="inlineLink">
                  Sign up
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