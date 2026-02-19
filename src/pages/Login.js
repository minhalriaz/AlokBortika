// src/pages/Login.js
import { Link } from "react-router-dom";
import "../App.css";

export default function Login() {
  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Welcome back</div>
          <h1 className="title">Login</h1>
          <p className="subtitle">Login to submit problems and track progress.</p>

          <div className="card" style={{ maxWidth: 520 }}>
            <form style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
                <input className="input" type="email" placeholder="you@example.com" />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Password</div>
                <input className="input" type="password" placeholder="••••••••" />
              </label>

              <button className="primary" type="submit">
                Login
              </button>

              <div style={{ color: "rgba(233,236,242,0.7)", fontWeight: 600 }}>
                New here? <Link to="/signup">Create an account</Link>
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
