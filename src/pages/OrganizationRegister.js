import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";
import "../App.css";

const ORG_TYPES = [
  "NGO", "CBO", "CSO", "Local Organization",
  "Government", "Municipal", "Disaster Committee", "Clinic", "Legal Aid"
];

const FOCUS_AREAS = [
  "Education", "Health", "Sanitation", "Environment",
  "Disaster Relief", "Women Empowerment", "Youth Development",
  "Poverty Alleviation", "Water & Hygiene", "Food Security",
  "Legal Aid", "Climate Change", "Community Development"
];

const DISTRICTS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet",
  "Rangpur", "Mymensingh", "Barisal", "Comilla", "Gazipur",
  "Narayanganj", "Tangail", "Jessore", "Cox's Bazar"
];

export default function OrganizationRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactPerson: "",
    phone: "",
    description: "",
    focusArea: [],
    services: "",
    website: "",
    registrationNumber: "",
    establishedYear: "",
    location: {
      village: "",
      union: "",
      upazila: "",
      district: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleFocusArea = (area) => {
    setFormData((prev) => ({
      ...prev,
      focusArea: prev.focusArea.includes(area)
        ? prev.focusArea.filter((a) => a !== area)
        : [...prev.focusArea, area],
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Organization name is required";
    if (!formData.type) return "Organization type is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.contactPerson.trim()) return "Contact person name is required";
    if (!formData.phone.trim()) return "Phone number is required";
    return null;
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        services: formData.services
          ? formData.services.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        establishedYear: formData.establishedYear
          ? parseInt(formData.establishedYear)
          : null,
      };
      delete payload.confirmPassword;

      const res = await api.post("/organization/register", payload);

      if (res.data.success) {
        localStorage.removeItem("orgToken");
        localStorage.removeItem("organization");
        setSuccess(true);
      } else {
        setError(res.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Account", "Contact", "Details"];

  if (success) {
    return (
      <div className="page">
        <div className="authPage">
          <div className="authWrapper">
            <div className="authCardNew orgAuthCard" style={{ maxWidth: "500px" }}>
              <div className="authCardRightNew" style={{ padding: "48px" }}>
                <div className="authFormWrapperNew" style={{ textAlign: "center" }}>
                  <div className="successIconNew">✓</div>
                  <h2>Registration Submitted!</h2>
                  <p className="successMessageNew">
                    Your organization has been registered successfully. An admin will review and approve your account. You'll be notified once approved.
                  </p>
                  <Link to="/organization/login" className="authSubmitBtnNew" style={{ display: "inline-block", textDecoration: "none" }}>
                    Go to Login
                  </Link>
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
                <h1>Register Organization</h1>
                <p>Join AlokBortika to coordinate volunteers and solve community problems.</p>
                
                <div className="orgStepListNew">
                  {stepLabels.map((label, i) => (
                    <div key={i} className={`orgStepItemNew ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "completed" : ""}`}>
                      <div className="orgStepNumberNew">{step > i + 1 ? "✓" : i + 1}</div>
                      <div className="orgStepLabelNew">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="authCardFooterNew">
                  <span>Already have an account?</span>
                  <Link to="/organization/login" className="authFooterLinkNew">Sign in</Link>
                </div>
              </div>
            </div>

            <div className="authCardRightNew">
              <div className="authFormWrapperNew">
                <div className="authFormHeaderNew">
                  <h2>{stepLabels[step - 1]}</h2>
                  <p>
                    {step === 1 && "Set up your organization account"}
                    {step === 2 && "Provide contact information"}
                    {step === 3 && "Add organization details"}
                  </p>
                </div>

                {error && <div className="authErrorNew">{error}</div>}

                {step === 1 && (
                  <form className="authFormNew" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    <div className="formGroupNew">
                      <label htmlFor="name">Organization Name</label>
                      <input
                        id="name"
                        className="authInputNew"
                        type="text"
                        name="name"
                        placeholder="e.g. Green Dhaka Foundation"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="type">Organization Type</label>
                      <select
                        id="type"
                        className="authInputNew"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select type</option>
                        {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="email">Official Email</label>
                      <input
                        id="email"
                        className="authInputNew"
                        type="email"
                        name="email"
                        placeholder="org@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                        minLength={6}
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        className="authInputNew"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <button className="authSubmitBtnNew" type="submit">
                      Continue
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form className="authFormNew" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    <div className="formGroupNew">
                      <label htmlFor="contactPerson">Contact Person Name</label>
                      <input
                        id="contactPerson"
                        className="authInputNew"
                        type="text"
                        name="contactPerson"
                        placeholder="Full name"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        className="authInputNew"
                        type="tel"
                        name="phone"
                        placeholder="e.g. 01712345678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="district">District</label>
                      <select
                        id="district"
                        className="authInputNew"
                        name="location.district"
                        value={formData.location.district}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="upazila">Upazila</label>
                      <input
                        id="upazila"
                        className="authInputNew"
                        type="text"
                        name="location.upazila"
                        placeholder="e.g. Mirpur"
                        value={formData.location.upazila}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="website">Website (optional)</label>
                      <input
                        id="website"
                        className="authInputNew"
                        type="url"
                        name="website"
                        placeholder="https://yourorg.org"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="formActionsRowNew">
                      <button className="authBackBtnNew" type="button" onClick={handleBack}>
                        Back
                      </button>
                      <button className="authSubmitBtnNew" type="submit">
                        Continue
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form className="authFormNew" onSubmit={handleSubmit}>
                    <div className="formGroupNew">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        className="authInputNew"
                        name="description"
                        placeholder="Briefly describe your organization's mission..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="services">Services/Projects</label>
                      <input
                        id="services"
                        className="authInputNew"
                        type="text"
                        name="services"
                        placeholder="e.g. Tree Planting, Free Clinic"
                        value={formData.services}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="formGroupNew">
                      <label>Focus Areas</label>
                      <div className="focusAreaGridNew">
                        {FOCUS_AREAS.map((area) => {
                          const selected = formData.focusArea.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              className={`focusAreaChipNew ${selected ? "selected" : ""}`}
                              onClick={() => toggleFocusArea(area)}
                            >
                              {selected ? "✓ " : ""}{area}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="establishedYear">Established Year</label>
                      <input
                        id="establishedYear"
                        className="authInputNew"
                        type="number"
                        name="establishedYear"
                        placeholder="e.g. 2010"
                        min={1900}
                        max={2026}
                        value={formData.establishedYear}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="formGroupNew">
                      <label htmlFor="registrationNumber">Registration No.</label>
                      <input
                        id="registrationNumber"
                        className="authInputNew"
                        type="text"
                        name="registrationNumber"
                        placeholder="Govt. reg. number"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="formActionsRowNew">
                      <button className="authBackBtnNew" type="button" onClick={handleBack}>
                        Back
                      </button>
                      <button className="authSubmitBtnNew" type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Registration"}
                      </button>
                    </div>
                  </form>
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
