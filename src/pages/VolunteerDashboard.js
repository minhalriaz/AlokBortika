import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import ProblemCard from "../components/ProblemCard";

export default function VolunteerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.post("/volunteer/dashboard", {
        userId: user.id,
      });

      if (res.data.success) {
        setDashboard(res.data.dashboard);
        setMessage("");
      } else {
        setMessage(res.data.message || "Failed to load dashboard");
      }
    } catch (error) {
      setMessage("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const assignProblem = async (problemId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.post(`/volunteer/assign/${problemId}`, {
        userId: user.id,
      });

      if (res.data.success) {
        setMessage("Problem assigned successfully");
        fetchDashboard();
      } else {
        setMessage(res.data.message || "Failed to assign problem");
      }
    } catch (error) {
      setMessage("Failed to assign problem");
    }
  };

  const markDone = async (problemId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.post(`/volunteer/done/${problemId}`, {
        userId: user.id,
      });

      if (res.data.success) {
        setMessage("Problem marked as done");
        fetchDashboard();
      } else {
        setMessage(res.data.message || "Failed to update status");
      }
    } catch (error) {
      setMessage("Failed to update status");
    }
  };

  return (
    <DashboardLayout
      title="Volunteer Dashboard"
      subtitle="Track tasks, pick open problems, and complete work transparently."
      role="volunteer"
    >
      {message ? (
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 14,
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#dbeafe",
          }}
        >
          {message}
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: "#cbd5e1" }}>Loading dashboard...</div>
      ) : !dashboard ? (
        <div style={{ color: "#fca5a5" }}>No dashboard data found.</div>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Completed Tasks"
              value={dashboard.stats.completedCount}
              hint="Tasks finished successfully"
            />
            <StatCard
              label="In Progress"
              value={dashboard.stats.inProgressCount}
              hint="Currently assigned to you"
            />
            <StatCard
              label="Available"
              value={dashboard.stats.availableCount}
              hint="Open problems you can pick"
            />
            <StatCard
              label="Impact Score"
              value={dashboard.stats.impactScore}
              hint="Based on completed work"
            />
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ marginBottom: 14 }}>Assigned Work</h2>
            <div style={{ display: "grid", gap: 16 }}>
              {dashboard.assignedProblems?.length ? (
                dashboard.assignedProblems.map((problem) => (
                  <ProblemCard
                    key={problem._id}
                    title={problem.title}
                    description={problem.description}
                    category={problem.category}
                    status={problem.status}
                    organizationName={problem.organizationName}
                    location={problem.location}
                    actionText="Mark as Done"
                    onAction={() => markDone(problem._id)}
                  />
                ))
              ) : (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                  }}
                >
                  No assigned tasks yet.
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 style={{ marginBottom: 14 }}>Available Problems</h2>
            <div style={{ display: "grid", gap: 16 }}>
              {dashboard.availableProblems?.length ? (
                dashboard.availableProblems.map((problem) => (
                  <ProblemCard
                    key={problem._id}
                    title={problem.title}
                    description={problem.description}
                    category={problem.category}
                    status={problem.status}
                    organizationName={problem.organizationName}
                    location={problem.location}
                    actionText="Take This Task"
                    onAction={() => assignProblem(problem._id)}
                  />
                ))
              ) : (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                  }}
                >
                  No open problems available right now.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}