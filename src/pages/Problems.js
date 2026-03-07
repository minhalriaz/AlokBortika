import { useMemo } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { loadReports } from "../utils/reportStorage";

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

export default function Problems() {
  const submittedReports = useMemo(() => loadReports(), []);

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Community issues</div>
          <h1 className="title">Browse Problems</h1>
          <p className="subtitle">
            These reports were submitted from the Submit page and are stored locally in your browser.
          </p>

          {submittedReports.length === 0 ? (
            <div className="aboutCard">
              <p>No submitted problems yet. Add one from the Submit page.</p>
            </div>
          ) : (
            <div className="cards">
              {submittedReports.map((report) => (
                <div className="card" key={report.id}>
                  <div className="cardTop">
                    <span className="status statusPending">{report.status}</span>
                    <h3>{report.title}</h3>
                  </div>
                  <p>Category: {report.category}</p>
                  <p>Location: {report.location}</p>
                  <p>Description: {report.description}</p>
                  <p>Submitted: {formatDate(report.submittedAt)}</p>
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
