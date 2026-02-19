// src/pages/Problems.js
import { Link } from "react-router-dom";
import "../App.css";

export default function Problems() {
  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Community issues</div>
          <h1 className="title">Browse Problems</h1>
          <p className="subtitle">
            This is where you’ll show all reported problems (later you can load them from a database).
          </p>

          <div className="cards">
            <div className="card">
              <div className="cardTop">
                <span className="step">DEMO</span>
                <h3>Road damage near market</h3>
              </div>
              <p>Status: Pending • Location: Example Area</p>
            </div>

            <div className="card">
              <div className="cardTop">
                <span className="step">DEMO</span>
                <h3>Street light not working</h3>
              </div>
              <p>Status: In review • Location: Example Area</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/">
              <button className="secondary">← Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
