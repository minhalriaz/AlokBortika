// src/pages/Login.js
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        console.log('Login successful:', result.message);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Welcome Back</div>
          <h1 className="title">Login</h1>
          <p className="subtitle">Sign in to your AlokBortika account.</p>

          <div className="card" style={{ maxWidth: 520 }}>
            {error && (
              <div style={{ 
                color: '#ff6b6b', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(255,107,107,0.1)', 
                borderRadius: '4px',
                border: '1px solid rgba(255,107,107,0.3)',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
                <input 
                  className="input" 
                  type="email" 
                  name="email"
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                />
              </label>

              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Password</div>
                <input 
                  className="input" 
                  type="password" 
                  name="password"
                  placeholder="Enter your password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                />
              </label>

              <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#6c5ce7' }}>
                  Forgot password?
                </Link>
              </div>

              <button 
                className="primary" 
                type="submit"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div style={{ color: "rgba(233,236,242,0.7)", fontWeight: 600 }}>
                Don't have an account? <Link to="/signup">Sign up</Link>
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