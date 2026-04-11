import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import "../App.css";

const STATUS_CONFIG = {
  open:        { label: "Open",        bg: "rgba(234,179,8,0.12)",   color: "#b45309", dot: "#f59e0b" },
  "in-progress": { label: "In Progress", bg: "rgba(59,130,246,0.12)", color: "#1d4ed8", dot: "#3b82f6" },
  done:        { label: "Done",        bg: "rgba(34,197,94,0.12)",   color: "#15803d", dot: "#22c55e" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem",
      fontWeight: 700, background: cfg.bg, color: cfg.color
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["#0f766e", "#2563eb", "#7c3aed", "#db2777", "#ea580c"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", border: "2px solid " + color + "44",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.35, color, flexShrink: 0
    }}>{initials}</div>
  );
}

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [problemFilter, setProblemFilter] = useState("all");
  const [showCreateProblem, setShowCreateProblem] = useState(false);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [newProblem, setNewProblem] = useState({ title: "", description: "", category: "General", location: "" });
  const [profileEdit, setProfileEdit] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getOrgToken = useCallback(() => localStorage.getItem("orgToken") || "", []);
  const orgHeaders = useCallback(() => ({ headers: { "org-authorization": "Bearer " + getOrgToken() } }), [getOrgToken]);
  const clearOrganizationSession = useCallback((message = "") => {
    localStorage.removeItem("orgToken");
    localStorage.removeItem("organization");
    if (message) {
      localStorage.setItem("organizationAuthError", message);
    } else {
      localStorage.removeItem("organizationAuthError");
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get("/organization/dashboard", orgHeaders());
      if (res.data.success) {
        setData(res.data.dashboard);
        const org = res.data.dashboard.organization;
        setProfileEdit({
          description: org.description || "",
          website: org.website || "",
          contactPerson: org.contactPerson || "",
          phone: org.phone || "",
          services: (org.services || []).join(", "),
          focusArea: (org.focusArea || []).join(", "),
        });
      } else {
        clearOrganizationSession(res.data.message || "");
        navigate("/organization/login");
      }
    } catch (error) {
      clearOrganizationSession(error?.response?.data?.message || "");
      navigate("/organization/login");
    } finally {
      setLoading(false);
    }
  }, [clearOrganizationSession, navigate, orgHeaders]);

  useEffect(() => {
    if (!localStorage.getItem("organization") || !localStorage.getItem("orgToken")) {
      clearOrganizationSession();
      navigate("/organization/login");
      return;
    }
    fetchDashboard();
  }, [clearOrganizationSession, fetchDashboard, navigate]);

  const handleLogout = async () => {
    try { await api.post("/organization/logout"); } catch {}
    localStorage.removeItem("orgToken");
    localStorage.removeItem("organization");
    localStorage.removeItem("organizationAuthError");
    navigate("/organization/login");
  };

  const handleAssignVolunteer = async (problemId, volunteerId) => {
    if (!volunteerId) return;
    const res = await api.post("/organization/assign/" + problemId, { volunteerId }, orgHeaders());
    if (res.data.success) { showToast("Volunteer assigned!"); fetchDashboard(); }
    else showToast(res.data.message, "error");
  };

  const handleUnassign = async (problemId) => {
    const res = await api.post("/organization/unassign/" + problemId, {}, orgHeaders());
    if (res.data.success) { showToast("Problem reopened."); fetchDashboard(); }
    else showToast(res.data.message, "error");
  };

  const handleMarkDone = async (problemId) => {
    const res = await api.post("/organization/problems/" + problemId + "/done", {}, orgHeaders());
    if (res.data.success) { showToast("Problem marked done! 🎉"); fetchDashboard(); }
    else showToast(res.data.message, "error");
  };

  const handleCreateProblem = async () => {
    if (!newProblem.title || !newProblem.description) { showToast("Title and description required.", "error"); return; }
    const res = await api.post("/organization/problems/create", newProblem, orgHeaders());
    if (res.data.success) {
      showToast("Problem created!");
      setNewProblem({ title: "", description: "", category: "General", location: "" });
      setShowCreateProblem(false);
      fetchDashboard();
    } else showToast(res.data.message, "error");
  };

  const fetchAvailableVolunteers = async () => {
    const res = await api.get("/organization/available-volunteers", orgHeaders());
    if (res.data.success) setAvailableVolunteers(res.data.availableVolunteers || []);
  };

  const handleAddVolunteer = async (volunteerId) => {
    const res = await api.post("/organization/add-volunteer", { volunteerId }, orgHeaders());
    if (res.data.success) { showToast("Volunteer added!"); fetchDashboard(); fetchAvailableVolunteers(); }
    else showToast(res.data.message, "error");
  };

  const handleRemoveVolunteer = async (volunteerId) => {
    const res = await api.post("/organization/remove-volunteer", { volunteerId }, orgHeaders());
    if (res.data.success) { showToast("Volunteer removed."); fetchDashboard(); }
    else showToast(res.data.message, "error");
  };

  const handleUpdateProfile = async () => {
    const payload = {
      ...profileEdit,
      services: profileEdit.services ? profileEdit.services.split(",").map((s) => s.trim()).filter(Boolean) : [],
      focusArea: profileEdit.focusArea ? profileEdit.focusArea.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    const res = await api.put("/organization/profile", payload, orgHeaders());
    if (res.data.success) { showToast("Profile updated!"); setShowEditProfile(false); fetchDashboard(); }
    else showToast(res.data.message, "error");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(15,118,110,0.2)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontWeight: 600 }}>Loading dashboard...</p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  if (!data) return null;

  const { organization, stats, problems, volunteers } = data;
  const filteredProblems = problemFilter === "all" ? problems : problems.filter((p) => p.status === problemFilter);

  const TABS = [
    { id: "overview",   label: "Overview",   icon: "📊" },
    { id: "problems",   label: "Problems",   icon: "📋", count: stats.total },
    { id: "volunteers", label: "Volunteers", icon: "👥", count: stats.volunteers },
    { id: "profile",    label: "Profile",    icon: "🏢" },
  ];

  const inputStyle = { padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", fontSize: "0.9rem", outline: "none" };
  const labelStyle = { fontWeight: 700, marginBottom: 5, fontSize: "0.88rem", color: "var(--text)", display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)", fontFamily: "Manrope, system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .orgBtn:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
        .orgCard:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.12) !important; }
        .orgBtn, .orgCard { transition: all 0.2s; }
        @media (max-width: 900px) { .orgDashboardShell { flex-direction: column; } .orgDashboardSidebar { width: 100% !important; height: auto !important; position: relative !important; border-right: none !important; border-bottom: 1px solid var(--border); } .orgDashboardMain { padding: 1rem !important; } }
        @media (max-width: 560px) { .orgDashboardMain { padding: 0.875rem !important; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: "14px", fontWeight: 700, fontSize: "0.9rem",
          background: toast.type === "error" ? "#dc2626" : "#15803d", color: "white",
          animation: "slideIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
        }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      <div className="orgDashboardShell" style={{ display: "flex", minHeight: "100vh" }}>

        {/* SIDEBAR */}
        <aside className="orgDashboardSidebar" style={{
          width: 240, flexShrink: 0, background: "var(--surface)",
          borderRight: "1px solid var(--border)", padding: "1.5rem 0",
          display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto"
        }}>
          <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,118,110,0.15)", border: "2px solid rgba(15,118,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏢</div>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--accent-strong)" }}>AlokBortika</span>
            </div>
            <div style={{ background: "rgba(15,118,110,0.08)", borderRadius: "10px", padding: "10px 12px" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{organization.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>{organization.type}</p>
              <div style={{
                marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "0.72rem", fontWeight: 700,
                color: organization.status === "active" ? "#15803d" : "#b45309",
                background: organization.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
                padding: "2px 8px", borderRadius: "999px"
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {organization.status}
              </div>
            </div>
          </div>

          <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px", border: "none",
                  cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", marginBottom: "4px", textAlign: "left",
                  background: activeTab === tab.id ? "rgba(15,118,110,0.1)" : "transparent",
                  color: activeTab === tab.id ? "var(--accent)" : "var(--muted)", transition: "all 0.15s"
                }}>
                <span>{tab.icon}</span>
                <span style={{ flex: 1 }}>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    background: activeTab === tab.id ? "var(--accent)" : "var(--surface-strong)",
                    color: activeTab === tab.id ? "white" : "var(--muted)",
                    borderRadius: "999px", padding: "1px 7px", fontSize: "0.72rem", fontWeight: 800
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--border)" }}>
            <button onClick={handleLogout}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.06)",
                color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
              🚪 Logout
            </button>
            <Link to="/" style={{ display: "block", textAlign: "center", marginTop: "8px", fontSize: "0.78rem", color: "var(--muted)" }}>← Back to website</Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="orgDashboardMain" style={{ flex: 1, padding: "2rem", overflowY: "auto", minWidth: 0 }}>

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.25rem" }}>Welcome back, {organization.contactPerson}! 👋</h1>
                <p style={{ color: "var(--muted)", margin: 0 }}>{organization.name} — Organization Dashboard</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total Problems", value: stats.total,       icon: "📋", color: "#3b82f6" },
                  { label: "Open",           value: stats.open,        icon: "🟡", color: "#f59e0b" },
                  { label: "In Progress",    value: stats.inProgress,  icon: "🔵", color: "#3b82f6" },
                  { label: "Completed",      value: stats.done,        icon: "✅", color: "#22c55e" },
                  { label: "Volunteers",     value: stats.volunteers,  icon: "👥", color: "#7c3aed" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "var(--surface)", borderRadius: "16px", padding: "1.25rem",
                    border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(15,23,42,0.05)"
                  }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.5rem", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>Recent Problems</h2>
                  <button onClick={() => setActiveTab("problems")} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}>View all →</button>
                </div>
                {problems.slice(0, 5).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                    No problems yet. <button onClick={() => { setActiveTab("problems"); setShowCreateProblem(true); }} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>Create one →</button>
                  </div>
                ) : problems.slice(0, 5).map((p) => (
                  <div key={p._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "10px", background: "var(--surface-strong)", marginBottom: "8px" }}>
                    <StatusBadge status={p.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>{p.category}</p>
                    </div>
                    {p.assignedVolunteer && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Avatar name={p.assignedVolunteer.name} size={22} />
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>{p.assignedVolunteer.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Create Problem", icon: "➕", action: () => { setActiveTab("problems"); setShowCreateProblem(true); }, color: "#0f766e" },
                  { label: "Add Volunteer",  icon: "👤", action: () => { setActiveTab("volunteers"); setShowAddVolunteer(true); fetchAvailableVolunteers(); }, color: "#2563eb" },
                  { label: "Edit Profile",   icon: "✏️", action: () => { setActiveTab("profile"); setShowEditProfile(true); }, color: "#7c3aed" },
                ].map((a) => (
                  <button key={a.label} onClick={a.action} className="orgBtn"
                    style={{
                      padding: "1rem", borderRadius: "14px", border: "1.5px solid " + a.color + "33",
                      background: a.color + "10", color: a.color, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem"
                    }}>
                    <span style={{ fontSize: "1.25rem" }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ PROBLEMS ═══ */}
          {activeTab === "problems" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Problems</h1>
                <button onClick={() => setShowCreateProblem(!showCreateProblem)} className="orgBtn"
                  style={{ padding: "10px 20px", borderRadius: "999px", background: "var(--accent)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  {showCreateProblem ? "✕ Cancel" : "➕ New Problem"}
                </button>
              </div>

              {showCreateProblem && (
                <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.5rem", border: "1.5px solid rgba(15,118,110,0.25)", marginBottom: "1.5rem", animation: "slideIn 0.2s ease" }}>
                  <h3 style={{ margin: "0 0 1rem", fontWeight: 800 }}>Create New Problem</h3>
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    <input style={inputStyle} placeholder="Problem title *" value={newProblem.title} onChange={(e) => setNewProblem((p) => ({ ...p, title: e.target.value }))} />
                    <textarea style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe the problem *" rows={3} value={newProblem.description} onChange={(e) => setNewProblem((p) => ({ ...p, description: e.target.value }))} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <select style={inputStyle} value={newProblem.category} onChange={(e) => setNewProblem((p) => ({ ...p, category: e.target.value }))}>
                        {["General","Sanitation","Education","Health","Infrastructure","Environment","Safety","Other"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <input style={inputStyle} placeholder="Location (optional)" value={newProblem.location} onChange={(e) => setNewProblem((p) => ({ ...p, location: e.target.value }))} />
                    </div>
                    <button onClick={handleCreateProblem} className="orgBtn"
                      style={{ padding: "10px", borderRadius: "10px", background: "var(--accent)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
                      Create Problem
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {[
                  { key: "all",         label: "All (" + problems.length + ")" },
                  { key: "open",        label: "Open (" + stats.open + ")" },
                  { key: "in-progress", label: "In Progress (" + stats.inProgress + ")" },
                  { key: "done",        label: "Done (" + stats.done + ")" },
                ].map((f) => (
                  <button key={f.key} onClick={() => setProblemFilter(f.key)}
                    style={{
                      padding: "6px 14px", borderRadius: "999px", fontWeight: 700, fontSize: "0.82rem",
                      border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
                      borderColor: problemFilter === f.key ? "var(--accent)" : "var(--border)",
                      background: problemFilter === f.key ? "rgba(15,118,110,0.1)" : "transparent",
                      color: problemFilter === f.key ? "var(--accent)" : "var(--muted)"
                    }}>{f.label}</button>
                ))}
              </div>

              {filteredProblems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>No problems found.</div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {filteredProblems.map((problem) => (
                    <div key={problem._id} className="orgCard"
                      style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                            <StatusBadge status={problem.status} />
                            <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, background: "var(--surface-strong)", color: "var(--muted)" }}>{problem.category}</span>
                          </div>
                          <h3 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "1rem" }}>{problem.title}</h3>
                          <p style={{ margin: "0 0 6px", color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>{problem.description}</p>
                          {problem.location && <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>📍 {problem.location}</p>}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
                          {problem.assignedVolunteer ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <Avatar name={problem.assignedVolunteer.name} size={28} />
                              <div>
                                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700 }}>{problem.assignedVolunteer.name}</p>
                                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>Assigned</p>
                              </div>
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic" }}>No volunteer assigned</p>
                          )}

                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {problem.status === "open" && (
                              <select defaultValue="" onChange={(e) => { if (e.target.value) handleAssignVolunteer(problem._id, e.target.value); }}
                                style={{ padding: "5px 10px", borderRadius: "8px", fontSize: "0.8rem", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                                <option value="">Assign volunteer</option>
                                {volunteers.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                              </select>
                            )}
                            {problem.status === "in-progress" && (
                              <>
                                <button onClick={() => handleMarkDone(problem._id)} className="orgBtn"
                                  style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "0.8rem", background: "rgba(34,197,94,0.1)", color: "#15803d", border: "1.5px solid rgba(34,197,94,0.3)", fontWeight: 700, cursor: "pointer" }}>
                                  ✓ Mark Done
                                </button>
                                <button onClick={() => handleUnassign(problem._id)} className="orgBtn"
                                  style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "0.8rem", background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1.5px solid rgba(220,38,38,0.2)", fontWeight: 700, cursor: "pointer" }}>
                                  Unassign
                                </button>
                              </>
                            )}
                            {problem.status === "done" && <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 700 }}>🎉 Completed</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ VOLUNTEERS ═══ */}
          {activeTab === "volunteers" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Volunteers ({volunteers.length})</h1>
                <button onClick={() => { setShowAddVolunteer(!showAddVolunteer); if (!showAddVolunteer) fetchAvailableVolunteers(); }} className="orgBtn"
                  style={{ padding: "10px 20px", borderRadius: "999px", background: "var(--accent)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  {showAddVolunteer ? "✕ Cancel" : "➕ Add Volunteer"}
                </button>
              </div>

              {showAddVolunteer && (
                <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.5rem", border: "1.5px solid rgba(37,99,235,0.25)", marginBottom: "1.5rem", animation: "slideIn 0.2s ease" }}>
                  <h3 style={{ margin: "0 0 1rem", fontWeight: 800 }}>Available Volunteers</h3>
                  {availableVolunteers.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>No available volunteers at the moment.</p>
                  ) : availableVolunteers.map((v) => (
                    <div key={v._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "10px", background: "var(--surface-strong)", marginBottom: "8px" }}>
                      <Avatar name={v.name} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>{v.name}</p>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>{v.email}</p>
                        {v.skills?.length > 0 && (
                          <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                            {v.skills.slice(0, 3).map((sk) => (
                              <span key={sk} style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "0.7rem", background: "rgba(15,118,110,0.1)", color: "var(--accent)", fontWeight: 700 }}>{sk}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleAddVolunteer(v._id)} className="orgBtn"
                        style={{ padding: "7px 16px", borderRadius: "8px", background: "var(--accent)", color: "white", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.82rem" }}>Add</button>
                    </div>
                  ))}
                </div>
              )}

              {volunteers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
                  <p style={{ fontWeight: 700 }}>No volunteers yet.</p>
                  <button onClick={() => { setShowAddVolunteer(true); fetchAvailableVolunteers(); }} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>Add volunteers →</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {volunteers.map((v) => (
                    <div key={v._id} style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
                        <Avatar name={v.name} size={44} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem" }}>{v.name}</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>{v.email}</p>
                        </div>
                      </div>
                      {v.bio && <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{v.bio.slice(0, 100)}{v.bio.length > 100 ? "..." : ""}</p>}
                      {v.skills?.length > 0 && (
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                          {v.skills.map((sk) => (
                            <span key={sk} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", background: "rgba(15,118,110,0.1)", color: "var(--accent)", fontWeight: 700 }}>{sk}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => handleRemoveVolunteer(v._id)} className="orgBtn"
                        style={{ width: "100%", padding: "7px", borderRadius: "8px", background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1.5px solid rgba(220,38,38,0.2)", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                        Remove from Organization
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ PROFILE ═══ */}
          {activeTab === "profile" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 720 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Organization Profile</h1>
                <button onClick={() => setShowEditProfile(!showEditProfile)} className="orgBtn"
                  style={{ padding: "10px 20px", borderRadius: "999px", border: "1.5px solid var(--border)", background: "var(--surface)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", color: "var(--text)" }}>
                  {showEditProfile ? "✕ Cancel" : "✏️ Edit Profile"}
                </button>
              </div>

              {showEditProfile ? (
                <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "1.5rem", border: "1.5px solid rgba(15,118,110,0.25)", animation: "slideIn 0.2s ease" }}>
                  <h3 style={{ margin: "0 0 1rem", fontWeight: 800 }}>Edit Profile</h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {[
                      { key: "contactPerson", label: "Contact Person",           placeholder: "Name" },
                      { key: "phone",         label: "Phone Number",             placeholder: "Phone" },
                      { key: "website",       label: "Website",                  placeholder: "https://" },
                      { key: "focusArea",     label: "Focus Areas (comma-sep.)", placeholder: "Education, Health..." },
                      { key: "services",      label: "Services (comma-sep.)",    placeholder: "Tree Planting, Free Clinic..." },
                    ].map(({ key, label, placeholder }) => (
                      <label key={key}>
                        <span style={labelStyle}>{label}</span>
                        <input style={inputStyle} placeholder={placeholder} value={profileEdit[key] || ""} onChange={(e) => setProfileEdit((p) => ({ ...p, [key]: e.target.value }))} />
                      </label>
                    ))}
                    <label>
                      <span style={labelStyle}>Description</span>
                      <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} placeholder="Organization description..." value={profileEdit.description || ""} onChange={(e) => setProfileEdit((p) => ({ ...p, description: e.target.value }))} />
                    </label>
                    <button onClick={handleUpdateProfile} className="orgBtn"
                      style={{ padding: "11px", borderRadius: "10px", background: "var(--accent)", color: "white", fontWeight: 800, border: "none", cursor: "pointer" }}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--surface)", borderRadius: "16px", padding: "2rem", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(15,118,110,0.12)", border: "2px solid rgba(15,118,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>🏢</div>
                    <div>
                      <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800 }}>{organization.name}</h2>
                      <p style={{ margin: "0 0 6px", color: "var(--muted)", fontSize: "0.9rem" }}>{organization.type}</p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
                        background: organization.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
                        color: organization.status === "active" ? "#15803d" : "#b45309"
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />{organization.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {[
                      { label: "Contact Person", value: organization.contactPerson,             icon: "👤" },
                      { label: "Email",           value: organization.email,                     icon: "📧" },
                      { label: "Phone",           value: organization.phone,                     icon: "📞" },
                      { label: "Website",         value: organization.website || "—",            icon: "🌐" },
                      { label: "District",        value: organization.location?.district || "—", icon: "📍" },
                      { label: "Upazila",         value: organization.location?.upazila || "—",  icon: "🗺️" },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={{ padding: "12px", background: "var(--surface-strong)", borderRadius: "10px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: "0.73rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{icon} {label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {organization.description && (
                    <div style={{ marginTop: "1.25rem", padding: "1rem", background: "var(--surface-strong)", borderRadius: "10px" }}>
                      <p style={{ margin: "0 0 5px", fontSize: "0.73rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>📝 Description</p>
                      <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>{organization.description}</p>
                    </div>
                  )}
                  {organization.focusArea?.length > 0 && (
                    <div style={{ marginTop: "1.25rem" }}>
                      <p style={{ margin: "0 0 8px", fontSize: "0.73rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🎯 Focus Areas</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {organization.focusArea.map((a) => <span key={a} style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", background: "rgba(15,118,110,0.1)", color: "var(--accent)", fontWeight: 700 }}>{a}</span>)}
                      </div>
                    </div>
                  )}
                  {organization.services?.length > 0 && (
                    <div style={{ marginTop: "1.25rem" }}>
                      <p style={{ margin: "0 0 8px", fontSize: "0.73rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🛠️ Services</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {organization.services.map((s) => <span key={s} style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", background: "var(--surface-strong)", color: "var(--muted)", fontWeight: 700, border: "1px solid var(--border)" }}>{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
