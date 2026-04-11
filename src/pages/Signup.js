import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [signupType, setSignupType] = useState("volunteer");
  const [formData, setFormData] = useState({
    name: "",
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
      const result = await register(formData);

      if (result.success) {
        const user = result.user || JSON.parse(localStorage.getItem("user") || "null");

        if (user?.role === "volunteer") {
          navigate("/volunteer-dashboard", { replace: true });
        } else if (user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user?.role === "organization") {
          navigate("/organization-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signupTypes = [
    { value: "volunteer", label: "Volunteer", icon: "👤", desc: "Join as a volunteer" },
    { value: "organization", label: "Organization", icon: "🏢", desc: "Register your organization" },
  ];

  return (
    <div className="page">
      <div className="authPage">
        <div className="authWrapper">
          <div className="authCardNew">
            <div className="authCardLeftNew signupLeft">
              <div className="authCardLeftContentNew">
                <Link to="/" className="authLogoNew">
                  AlokBortika
                </Link>
                <h1>Join Our Community</h1>
                <p>Create an account to start reporting and solving local problems together.</p>
                
                <div className="authBenefitsNew">
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Submit community problems</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Connect with volunteers</span>
                  </div>
                  <div className="authBenefitNew">
                    <span className="authBenefitIconNew">✓</span>
                    <span>Track progress together</span>
                  </div>
                </div>

                <div className="authCardFooterNew">
                  <span>Already have an account?</span>
                  <Link to="/login" className="authFooterLinkNew">Sign in</Link>
                </div>
              </div>
            </div>

            <div className="authCardRightNew">
              <div className="authFormWrapperNew">
                <div className="authFormHeaderNew">
                  <h2>Create Account</h2>
                  <p>Choose your account type</p>
                </div>

                <div className="signupTypeGridNew">
                  {signupTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`signupTypeCardNew ${signupType === type.value ? "active" : ""}`}
                      onClick={() => {
                        setSignupType(type.value);
                        setError("");
                      }}
                    >
                      <span className="signupTypeIconNew">{type.icon}</span>
                      <div className="signupTypeInfoNew">
                        <span className="signupTypeLabelNew">{type.label}</span>
                        <span className="signupTypeDescNew">{type.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {signupType === "organization" && (
                  <div className="orgRedirectNew">
                    <p>Organization registration has a separate form with more details.</p>
                    <Link to="/organization/register" className="orgRedirectBtnNew">
                      Go to Organization Registration →
                    </Link>
                  </div>
                )}

                {signupType === "volunteer" && (
                  <>
                    {error && <div className="authErrorNew">{error}</div>}

                    <form className="authFormNew" onSubmit={handleSubmit}>
                      <div className="formGroupNew">
                        <label htmlFor="name">Full Name</label>
                        <input
                          id="name"
                          className="authInputNew"
                          type="text"
                          name="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="formGroupNew">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          className="authInputNew"
                          type="email"
                          name="email"
                          placeholder="you@example.com"
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
                          minLength={6}
                        />
                        <small className="authHintNew">Must be at least 6 characters</small>
                      </div>

                      <button
                        className="authSubmitBtnNew"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </button>
                    </form>
                  </>
                )}

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