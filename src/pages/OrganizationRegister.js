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
        const org = res.data.organization;
        if (res.data.token) localStorage.setItem("orgToken", res.data.token);
        localStorage.setItem("organization", JSON.stringify(org));
        setSuccess(true);
      } else {
        setError(res.data.message || "Registration failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="bgGlow bgGlow1" /><div className="bgGlow bgGlow2" />
        <div style={{ textAlign: "center", maxWidth: 480, padding: "2rem" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", margin: "0 auto 1.5rem"
          }}>✅</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Registration Successful!
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Your organization has been registered. An admin will review and approve
            your account shortly. You can login once approved.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/organization/login" className="primary" style={{
              padding: "10px 24px", borderRadius: "999px", background: "var(--accent)",
              color: "white", fontWeight: 700
            }}>
              Go to Login
            </Link>
            <Link to="/" style={{
              padding: "10px 24px", borderRadius: "999px",
              border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 600
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ["Account", "Contact", "Details"];

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" /><div className="bgGlow bgGlow2" />

      {/* Navbar */}
      <nav className="nav">
        <div className="brand">
          <div className="brandMark"><div className="brandMarkDot" /></div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--accent-strong)" }}>AlokBortika</span>
        </div>
        <Link to="/organization/login" style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 600 }}>
          Already registered? Login →
        </Link>
      </nav>

      <div style={{
        maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 4rem"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(15,118,110,0.1)", color: "var(--accent)",
            padding: "6px 16px", borderRadius: "999px", fontSize: "0.82rem",
            fontWeight: 700, marginBottom: "1rem", border: "1px solid rgba(15,118,110,0.2)"
          }}>🏢 Organization Registration</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Register Your Organization
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Join AlokBortika to coordinate volunteers and solve community problems.
          </p>
        </div>

        {/* Step Progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "2rem" }}>
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const active = num === step;
            const done = num < step;
            return (
              <div key={num} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: done ? "var(--accent)" : active ? "var(--accent)" : "var(--surface-strong)",
                    color: done || active ? "white" : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "0.9rem",
                    border: active ? "none" : done ? "none" : "2px solid var(--border)",
                    transition: "all 0.3s"
                  }}>
                    {done ? "✓" : num}
                  </div>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 700,
                    color: active ? "var(--accent)" : "var(--muted)"
                  }}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{
                    width: 80, height: 2,
                    background: done ? "var(--accent)" : "var(--border)",
                    margin: "0 4px 20px", transition: "background 0.3s"
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="card authCard" style={{ padding: "2rem" }}>
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: "12px", padding: "12px 16px", color: "#dc2626",
              marginBottom: "1.25rem", fontSize: "0.9rem", fontWeight: 600
            }}>⚠️ {error}</div>
          )}

          {/* ── STEP 1: Account Info ── */}
          {step === 1 && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 800 }}>
                Account Information
              </h3>

              <label>
                <div style={labelStyle}>Organization Name *</div>
                <input className="input" type="text" name="name"
                  placeholder="e.g. Green Dhaka Foundation"
                  value={formData.name} onChange={handleChange} required />
              </label>

              <label>
                <div style={labelStyle}>Organization Type *</div>
                <select className="input" name="type" value={formData.type} onChange={handleChange} required>
                  <option value="">-- Select type --</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label>
                <div style={labelStyle}>Official Email *</div>
                <input className="input" type="email" name="email"
                  placeholder="org@example.com"
                  value={formData.email} onChange={handleChange} required />
              </label>

              <label>
                <div style={labelStyle}>Password *</div>
                <input className="input" type="password" name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password} onChange={handleChange} required minLength={6} />
              </label>

              <label>
                <div style={labelStyle}>Confirm Password *</div>
                <input className="input" type="password" name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword} onChange={handleChange} required />
              </label>
            </div>
          )}

          {/* ── STEP 2: Contact & Location ── */}
          {step === 2 && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 800 }}>
                Contact & Location
              </h3>

              <label>
                <div style={labelStyle}>Contact Person Name *</div>
                <input className="input" type="text" name="contactPerson"
                  placeholder="Full name of primary contact"
                  value={formData.contactPerson} onChange={handleChange} required />
              </label>

              <label>
                <div style={labelStyle}>Phone Number *</div>
                <input className="input" type="tel" name="phone"
                  placeholder="e.g. 01712345678"
                  value={formData.phone} onChange={handleChange} required />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label>
                  <div style={labelStyle}>District</div>
                  <select className="input" name="location.district"
                    value={formData.location.district} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                <label>
                  <div style={labelStyle}>Upazila</div>
                  <input className="input" type="text" name="location.upazila"
                    placeholder="e.g. Mirpur"
                    value={formData.location.upazila} onChange={handleChange} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label>
                  <div style={labelStyle}>Union</div>
                  <input className="input" type="text" name="location.union"
                    placeholder="Union name"
                    value={formData.location.union} onChange={handleChange} />
                </label>

                <label>
                  <div style={labelStyle}>Village / Area</div>
                  <input className="input" type="text" name="location.village"
                    placeholder="Village / Ward"
                    value={formData.location.village} onChange={handleChange} />
                </label>
              </div>

              <label>
                <div style={labelStyle}>Website (optional)</div>
                <input className="input" type="url" name="website"
                  placeholder="https://yourorg.org"
                  value={formData.website} onChange={handleChange} />
              </label>
            </div>
          )}

          {/* ── STEP 3: Details ── */}
          {step === 3 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 800 }}>
                Organization Details
              </h3>

              <label>
                <div style={labelStyle}>Description</div>
                <textarea className="input" name="description"
                  placeholder="Briefly describe your organization's mission and work..."
                  value={formData.description} onChange={handleChange}
                  rows={3} style={{ resize: "vertical" }} />
              </label>

              <label>
                <div style={labelStyle}>Services / Projects (comma-separated)</div>
                <input className="input" type="text" name="services"
                  placeholder="e.g. Tree Planting, Free Clinic, Water Distribution"
                  value={formData.services} onChange={handleChange} />
              </label>

              <div>
                <div style={{ ...labelStyle, marginBottom: "0.75rem" }}>Focus Areas</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {FOCUS_AREAS.map((area) => {
                    const selected = formData.focusArea.includes(area);
                    return (
                      <button key={area} type="button" onClick={() => toggleFocusArea(area)}
                        style={{
                          padding: "6px 14px", borderRadius: "999px", fontSize: "0.82rem",
                          fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                          borderColor: selected ? "var(--accent)" : "var(--border)",
                          background: selected ? "rgba(15,118,110,0.12)" : "transparent",
                          color: selected ? "var(--accent)" : "var(--muted)",
                          transition: "all 0.2s"
                        }}>
                        {selected ? "✓ " : ""}{area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label>
                  <div style={labelStyle}>Established Year</div>
                  <input className="input" type="number" name="establishedYear"
                    placeholder="e.g. 2010" min={1900} max={2026}
                    value={formData.establishedYear} onChange={handleChange} />
                </label>

                <label>
                  <div style={labelStyle}>Registration No.</div>
                  <input className="input" type="text" name="registrationNumber"
                    placeholder="Govt. reg. number"
                    value={formData.registrationNumber} onChange={handleChange} />
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
            {step > 1 && (
              <button type="button" onClick={handleBack}
                style={{
                  flex: 1, padding: "11px", borderRadius: "12px",
                  border: "1.5px solid var(--border)", background: "transparent",
                  color: "var(--muted)", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem"
                }}>
                ← Back
              </button>
            )}

            {step < 3 ? (
              <button type="button" onClick={handleNext}
                style={{
                  flex: 2, padding: "11px", borderRadius: "12px",
                  background: "var(--accent)", color: "white",
                  fontWeight: 800, cursor: "pointer", fontSize: "0.95rem", border: "none"
                }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{
                  flex: 2, padding: "11px", borderRadius: "12px",
                  background: "var(--accent)", color: "white",
                  fontWeight: 800, cursor: "pointer", fontSize: "0.95rem", border: "none",
                  opacity: loading ? 0.7 : 1
                }}>
                {loading ? "Registering..." : "✅ Submit Registration"}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--muted)", fontSize: "0.88rem" }}>
          Already registered?{" "}
          <Link to="/organization/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  fontWeight: 700, marginBottom: 6, fontSize: "0.88rem", color: "var(--text)"
};
