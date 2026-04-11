import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

export default function OrganizationLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedMessage = localStorage.getItem("organizationAuthError");
    if (savedMessage) {
      setError(savedMessage);
      localStorage.removeItem("organizationAuthError");
    }
  }, []);

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

        if (org.status === "pending") {
          localStorage.removeItem("orgToken");
          localStorage.removeItem("organization");
          setError("Your organization is awaiting admin approval. You'll be notified once approved.");
          setLoading(false);
          return;
        }

        if (res.data.token) {
          localStorage.setItem("orgToken", res.data.token);
        }
        localStorage.setItem("organization", JSON.stringify(org));

        navigate("/organization-dashboard", { replace: true });
      } else {
        localStorage.removeItem("orgToken");
        localStorage.removeItem("organization");
        localStorage.removeItem("organizationAuthError");
        setError(res.data.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="authPage">
        <div className="authWrapper">
          <div className="authCardNew orgAuthCard">
            <div className="authCardLeftNew orgAuthLeft">
              <div className="authCardLeftContentNew">
                <Link to="/" className="authLogoNew">
                  AlokBortika
                </Link>
                <h1>Organization Portal</h1>
                <p>Manage your organization, coordinate volunteers, and solve community problems.</p>
                
                <div className="authBenefitsNew">
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Post volunteer opportunities</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Manage your volunteer team</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Track problem resolutions</span>
                  </div>
                </div>

                <div className="authCardFooterNew">
                  <span>Join as organization</span>
                  <Link to="/organization/register" className="authFooterLinkNew">Register</Link>
                </div>
              </div>
            </div>

            <div className="authCardRightNew">
              <div className="authFormWrapperNew">
                <div className="authFormHeaderNew">
                  <h2>Organization Login</h2>
                  <p>Enter your organization credentials</p>
                </div>

                {error && <div className="authErrorNew">{error}</div>}

                <form className="authFormNew" onSubmit={handleSubmit}>
                  <div className="formGroupNew">
                    <label htmlFor="email">Organization Email</label>
                    <input
                      id="email"
                      className="authInputNew"
                      type="email"
                      name="email"
                      placeholder="org@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="formGroupNew">
                    <label htmlFor="password">Password</label>
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
                    {loading ? "Signing in..." : "Sign In to Dashboard"}
                  </button>
                </form>

                <div className="authFormFooterNew">
                  Don't have an organization? <Link to="/organization/register">Register here</Link>
                </div>

                <div className="authAltLinksNew">
                  <Link to="/login">← Volunteer Login</Link>
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
