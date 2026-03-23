import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import volunteerService from "../services/volunteerService";

export default function VolunteerProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const response = await volunteerService.getProfile();

    if (response.success) {
      setUser(response.user);
      setForm({
        name: response.user.name || "",
        bio: response.user.bio || "",
        skills: response.user.skills?.join(", ") || "",
      });
      setMessage("");
    } else {
      setMessage(response.message || "Failed to load profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await volunteerService.updateProfile(form);
    setMessage(response.message);

    if (response.success) {
      setUser(response.user);
    }

    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading profile picture...");

    const response = await volunteerService.uploadProfilePicture(file);
    setMessage(response.message);

    if (response.success) {
      setUser(response.user);
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(16,185,129,0.18), transparent 25%), #0f172a",
          color: "#fff",
        }}
      >
        <div
          style={{
            padding: "24px 32px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(16,185,129,0.18), transparent 25%), #0f172a",
        color: "#e2e8f0",
        padding: "28px 20px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(79,70,229,0.18)",
                color: "#c7d2fe",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              VOLUNTEER PROFILE
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "#fff",
              }}
            >
              My Professional Profile
            </h1>
            <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 15 }}>
              Manage your identity, volunteer skills, and completed work history.
            </p>
          </div>

          <Link
            to="/volunteer-dashboard"
            style={{
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {message ? (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 18px",
              borderRadius: 16,
              background: "rgba(59,130,246,0.14)",
              border: "1px solid rgba(59,130,246,0.28)",
              color: "#dbeafe",
              boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
            }}
          >
            {message}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: 22,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 28,
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              position: "sticky",
              top: 20,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 168,
                  height: 168,
                  margin: "0 auto 18px",
                  padding: 6,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(79,70,229,1), rgba(59,130,246,0.8), rgba(16,185,129,0.8))",
                }}
              >
                <img
                  src={
                    user?.profilePicture
                      ? `http://localhost:5000${user.profilePicture}`
                      : "https://via.placeholder.com/180"
                  }
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #0f172a",
                    background: "#111827",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.target.style.transform = "scale(1.04)")}
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                />
              </div>

              <h2 style={{ margin: "0 0 8px", color: "#fff", fontSize: 28 }}>
                {user?.name || "Volunteer"}
              </h2>

              <p style={{ margin: "0 0 8px", color: "#94a3b8" }}>
                {user?.email}
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(16,185,129,0.14)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#a7f3d0",
                  fontWeight: 700,
                  textTransform: "capitalize",
                  fontSize: 13,
                  marginBottom: 18,
                }}
              >
                {user?.role || "volunteer"}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                    Completed
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>
                    {user?.completedTasks?.length || 0}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                    Skills
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>
                    {user?.skills?.length || 0}
                  </div>
                </div>
              </div>

              <label
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  padding: "12px 18px",
                  borderRadius: 14,
                  background: uploading ? "#475569" : "#4f46e5",
                  color: "#fff",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  transition: "0.3s",
                  boxShadow: "0 12px 30px rgba(79,70,229,0.35)",
                }}
                onMouseOver={(e) => {
                  if (!uploading) e.target.style.opacity = "0.9";
                }}
                onMouseOut={(e) => {
                  if (!uploading) e.target.style.opacity = "1";
                }}
              >
                {uploading ? "Uploading..." : "Upload Picture"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gap: 22 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                padding: 24,
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, color: "#fff", fontSize: 28 }}>
                  Edit Professional Profile
                </h2>
                <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                  Keep your public profile polished and up to date.
                </p>
              </div>

              <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
                <label>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#e2e8f0",
                    }}
                  >
                    Full Name
                  </div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(15,23,42,0.8)",
                      color: "#fff",
                      outline: "none",
                      fontSize: 15,
                    }}
                  />
                </label>

                <label>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#e2e8f0",
                    }}
                  >
                    Bio
                  </div>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write a professional summary about your volunteer work..."
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(15,23,42,0.8)",
                      color: "#fff",
                      outline: "none",
                      fontSize: 15,
                      resize: "vertical",
                    }}
                  />
                </label>

                <label>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#e2e8f0",
                    }}
                  >
                    Skills (comma separated)
                  </div>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Teamwork, Community Support, Field Work, Reporting"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(15,23,42,0.8)",
                      color: "#fff",
                      outline: "none",
                      fontSize: 15,
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: 4,
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: "none",
                    background: saving ? "#475569" : "linear-gradient(135deg, #4f46e5, #2563eb)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 14px 34px rgba(37,99,235,0.35)",
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 22,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 28,
                  padding: 24,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#fff", fontSize: 22 }}>Skills</h3>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {user?.skills?.length ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 999,
                          background: "rgba(79,70,229,0.15)",
                          border: "1px solid rgba(79,70,229,0.35)",
                          color: "#c7d2fe",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", margin: 0 }}>No skills added yet.</p>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 28,
                  padding: 24,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#fff", fontSize: 22 }}>
                  Profile Snapshot
                </h3>

                <div style={{ display: "grid", gap: 12 }}>
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>Volunteer Name</div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>{user?.name || "N/A"}</div>
                  </div>

                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>Email</div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>{user?.email || "N/A"}</div>
                  </div>

                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>Bio</div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>
                      {user?.bio || "No bio added yet."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                padding: 24,
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#fff", fontSize: 24 }}>
                Completed Work
              </h3>

              {user?.completedTasks?.length ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {user.completedTasks.map((task, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18,
                        padding: 16,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px", color: "#fff", fontSize: 18 }}>
                        {task.title}
                      </h4>
                      <div style={{ display: "grid", gap: 6, color: "#cbd5e1" }}>
                        <p style={{ margin: 0 }}>
                          <strong>Organization:</strong> {task.organizationName || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Category:</strong> {task.category || "General"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Date:</strong>{" "}
                          {task.completedAt
                            ? new Date(task.completedAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", margin: 0 }}>No completed work yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}