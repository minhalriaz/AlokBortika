// src/pages/Signup.js
import { Link } from "react-router-dom";
import "../App.css";

export default function Signup() {
  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Join AlokBortika</div>
          <h1 className="title">Sign up</h1>
          <p className="subtitle">Create an account to submit and follow progress.</p>

          <div className="card" style={{ maxWidth: 520 }}>
            <form style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Full name</div>
                <input className="input" type="text" placeholder="Your name" />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
                <input className="input" type="email" placeholder="you@example.com" />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Password</div>
                <input className="input" type="password" placeholder="Create a password" />
              </label>

              <button className="primary" type="submit">
                Create account
              </button>

              <div style={{ color: "rgba(233,236,242,0.7)", fontWeight: 600 }}>
                Already have an account? <Link to="/login">Login</Link>
              </div>

              <div style={{ marginTop: 6 }}>
                <Link to="/">← Back to home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
