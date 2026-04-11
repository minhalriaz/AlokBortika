import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import api from "../api/api";

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

export default function Problems() {
  const [submittedReports, setSubmittedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await api.get("/problem/all");

        if (response.data.success) {
          setSubmittedReports(response.data.problems || []);
        } else {
          setErrorMessage(response.data.message || "Failed to load problems.");
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Something went wrong while loading problems."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleStatusChange = async (problemId, newStatus) => {
    try {
      const response = await api.put(`/problem/update-status/${problemId}`, {
        status: newStatus,
        userId: currentUser?._id,
      });

      if (response.data.success) {
        setSubmittedReports((prev) =>
          prev.map((report) =>
            report._id === problemId
              ? { ...report, status: newStatus }
              : report
          )
        );
      } else {
        alert(response.data.message || "Failed to update status");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Community issues</div>
          <h1 className="title">Browse Problems</h1>
          <p className="subtitle">
            These reports were submitted from the Submit page and are loaded from the database.
          </p>

          {loading ? (
            <div className="aboutCard">
              <p>Loading problems...</p>
            </div>
          ) : errorMessage ? (
            <div className="aboutCard">
              <p>{errorMessage}</p>
            </div>
          ) : submittedReports.length === 0 ? (
            <div className="aboutCard">
              <p>No submitted problems yet. Add one from the Submit page.</p>
            </div>
          ) : (
            <div className="cards">
              {submittedReports.map((report) => (
                <div className="card" key={report._id}>
                  <div className="cardTop">
                    <span className="status statusPending">
                      {report.status === "open"
                        ? "Open"
                        : report.status === "in-progress"
                        ? "In Progress"
                        : report.status === "done"
                        ? "Done"
                        : "Open"}
                    </span>
                    <h3>{report.title}</h3>
                  </div>

                  {isAdmin ? (
                    <div style={{ marginTop: 10, marginBottom: 10 }}>
                      <label>Status: </label>
                      <select
                        value={report.status}
                        onChange={(e) =>
                          handleStatusChange(report._id, e.target.value)
                        }
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          marginLeft: "8px",
                        }}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  ) : null}

                  <p>Category: {report.category}</p>
                  <p>Location: {report.location}</p>
                  <p>Description: {report.description}</p>
                  <p>
                    Submitted: {formatDate(report.createdAt || report.submittedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <Link to="/submit">
              <button className="primary">Submit Another Problem</button>
            </Link>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/">
              <button className="secondary">&lt;- Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}