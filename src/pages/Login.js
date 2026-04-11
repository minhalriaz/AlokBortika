import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [loginType, setLoginType] = useState("volunteer");
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
      if (loginType === "volunteer" || loginType === "admin") {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setError(result.message || "Invalid email or password.");
          setLoading(false);
          return;
        }

        const user = result.user;

        if (loginType === "admin" && user?.role !== "admin") {
          await logout();
          setError("This page is for admin accounts only.");
          setLoading(false);
          return;
        }

        if (user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user?.role === "volunteer") {
          navigate("/volunteer-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else if (loginType === "organization") {
        const res = await api.post("/organization/login", formData);

        if (res.data.success) {
          const org = res.data.organization;

          if (org.status === "pending") {
            localStorage.removeItem("orgToken");
            localStorage.removeItem("organization");
            setError("Your organization is awaiting admin approval. You will be notified once approved.");
            setLoading(false);
            return;
          }

          if (res.data.token) localStorage.setItem("orgToken", res.data.token);
          localStorage.setItem("organization", JSON.stringify(org));
          localStorage.removeItem("organizationAuthError");

          navigate("/organization-dashboard", { replace: true });
        } else {
          localStorage.removeItem("orgToken");
          localStorage.removeItem("organization");
          setError(res.data.message || "Invalid email or password.");
        }
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginTypes = [
    { value: "volunteer", label: "Volunteer", icon: "👤" },
    { value: "organization", label: "Organization", icon: "🏢" },
    { value: "admin", label: "Admin", icon: "⚙️" },
  ];

  return (
    <div className="page">
      <div className="authPage">
        <div className="authWrapper">
          <div className="authCardNew">
            <div className="authCardLeftNew">
              <div className="authCardLeftContentNew">
                <Link to="/" className="authLogoNew">
                  AlokBortika
                </Link>
                <h1>Welcome Back</h1>
                <p>Sign in to continue making a difference in your community.</p>
                
                <div className="authBenefitsNew">
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Track your submitted reports</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Connect with local volunteers</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>See community impact</span>
                  </div>
                </div>

                <div className="authCardFooterNew">
                  <span>Join our community</span>
                  <Link to="/signup" className="authFooterLinkNew">Sign up</Link>
                </div>
              </div>
            </div>

            <div className="authCardRightNew">
              <div className="authFormWrapperNew">
                <div className="authFormHeaderNew">
                  <h2>Sign In</h2>
                  <p>Select your account type</p>
                </div>

                <div className="loginTypeGridNew">
                  {loginTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`loginTypeCardNew ${loginType === type.value ? "active" : ""}`}
                      onClick={() => {
                        setLoginType(type.value);
                        setError("");
                      }}
                    >
                      <span className="loginTypeIconNew">{type.icon}</span>
                      <span className="loginTypeLabelNew">{type.label}</span>
                    </button>
                  ))}
                </div>

                {error && <div className="authErrorNew">{error}</div>}

                <form className="authFormNew" onSubmit={handleSubmit}>
                  <div className="formGroupNew">
                    <label htmlFor="email">
                      {loginType === "organization" ? "Organization Email" : "Email Address"}
                    </label>
                    <input
                      id="email"
                      className="authInputNew"
                      type="email"
                      name="email"
                      placeholder={loginType === "organization" ? "org@example.com" : "you@example.com"}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="formGroupNew">
                    <div className="formLabelRowNew">
                      <label htmlFor="password">Password</label>
                      {loginType === "volunteer" && (
                        <Link to="/forgot-password" className="authForgotLinkNew">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <input
                      id="password"
                      className="authInputNew"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    className="authSubmitBtnNew"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : `Sign in as ${loginType}`}
                  </button>
                </form>

                <div className="authFormFooterNew">
                  {loginType === "volunteer" ? (
                    <>
                      Don't have an account? <Link to="/signup">Sign up</Link>
                    </>
                  ) : loginType === "organization" ? (
                    <>
                      Don't have an organization? <Link to="/organization/register">Register</Link>
                    </>
                  ) : null}
                </div>

                <Link to="/" className="authBackLinkNew">
                  <span>←</span> Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
