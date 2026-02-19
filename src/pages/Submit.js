import { Link } from "react-router-dom";
import "../App.css";

export default function Submit() {
  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Submit Page</div>

          <h1 className="title">
            Submit a <span className="glowText">Problem</span>
          </h1>

          <p className="subtitle">
            This page will be implemented by my teammate.  
            For now, the landing page routing is working correctly.
          </p>

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
