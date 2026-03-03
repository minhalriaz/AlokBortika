import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      {/* Simple Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'rgba(10, 14, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(108, 92, 231, 0.2)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>AlokBortika</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* User Icon and Name */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'rgba(108, 92, 231, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            border: '1px solid rgba(108, 92, 231, 0.3)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c5ce7, #a463f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ color: 'white', fontWeight: 500 }}>
              {user?.name || 'User'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #ff6b6b',
              color: '#ff6b6b',
              padding: '0.5rem 1.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff6b6b';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ff6b6b';
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="hero" style={{ paddingTop: '80px' }}>
        <div className="heroInner">
          <div className="badge">Dashboard</div>
          <h1 className="title">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="subtitle">This is your personal dashboard.</p>

          {/* Simple Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            {/* Card 1 */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#6c5ce7', marginBottom: '0.5rem' }}>Profile</h3>
              <p style={{ color: 'rgba(233,236,242,0.7)' }}>Email: {user?.email || 'N/A'}</p>
              <p style={{ color: 'rgba(233,236,242,0.7)' }}>Member since: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#6c5ce7', marginBottom: '0.5rem' }}>Activity</h3>
              <p style={{ color: 'rgba(233,236,242,0.7)' }}>Projects: 0</p>
              <p style={{ color: 'rgba(233,236,242,0.7)' }}>Tasks: 0</p>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#6c5ce7', marginBottom: '0.5rem' }}>Status</h3>
              <p style={{ color: 'rgba(233,236,242,0.7)' }}>
                Account: {user?.isAccountVerified ? '✅ Verified' : '⚠️ Not Verified'}
              </p>
            </div>
          </div>

          {/* Simple Content Area */}
          <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Getting Started</h2>
            <p style={{ color: 'rgba(233,236,242,0.7)', lineHeight: 1.6 }}>
              This is your dashboard. You can start adding your projects, tasks, 
              and track your progress here. The interface is clean and simple to help 
              you focus on what matters most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;