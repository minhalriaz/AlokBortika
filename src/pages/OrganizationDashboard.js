import { useEffect, useState } from "react";
import api from "../api/api";

export default function OrganizationDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboard = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.post("/organization/dashboard", {
        userId: user.id,
      });

      if (res.data.success) {
        setData(res.data.dashboard);
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

  const assignVolunteer = async (problemId, volunteerId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.post(`/organization/assign/${problemId}`, {
        userId: user.id,
        volunteerId,
      });

      if (res.data.success) {
        setMessage("Volunteer assigned successfully");
        fetchDashboard();
      } else {
        setMessage(res.data.message || "Assignment failed");
      }
    } catch (error) {
      setMessage("Assignment failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>{message || "No data found"}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Organization Dashboard</h1>

      {message ? <p>{message}</p> : null}

      <h3>Stats</h3>
      <p>Total: {data.stats.total}</p>
      <p>Open: {data.stats.open}</p>
      <p>In Progress: {data.stats.inProgress}</p>
      <p>Done: {data.stats.done}</p>

      <h3>Problems</h3>
      {data.problems.map((problem) => (
        <div
          key={problem._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h4>{problem.title}</h4>
          <p>{problem.description}</p>
          <p>Status: {problem.status}</p>
          <p>
            Assigned Volunteer:{" "}
            {problem.assignedVolunteer?.name || "Not assigned"}
          </p>

          {problem.status === "open" && (
            <div style={{ marginTop: "10px" }}>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    assignVolunteer(problem._id, e.target.value);
                  }
                }}
              >
                <option value="">Select volunteer</option>
                {data.volunteers.map((volunteer) => (
                  <option key={volunteer._id} value={volunteer._id}>
                    {volunteer.name} ({volunteer.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}