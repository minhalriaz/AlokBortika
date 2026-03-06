import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function currentMonthYear() {
  return new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <nav className="dashboardNav">
        <h2 className="dashboardBrand">AlokBortika</h2>

        <div className="dashboardActions">
          <div className="dashboardUser">
            <span className="dashboardAvatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
            <span className="dashboardName">{user?.name || "User"}</span>
          </div>

          <button className="dangerBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="hero dashboardMain">
        <div className="heroInner">
          <div className="badge">Your workspace</div>
          <h1 className="title">Welcome back, {user?.name || "User"}</h1>
          <p className="subtitle">
            Track reports, support community action, and keep your profile up to date.
          </p>

          <div className="dashboardGrid">
            <div className="card">
              <h3 className="dashboardCardTitle">Profile</h3>
              <p className="dashboardValue">Email: {user?.email || "N/A"}</p>
              <p className="dashboardValue">Active month: {currentMonthYear()}</p>
            </div>

            <div className="card">
              <h3 className="dashboardCardTitle">Account Status</h3>
              <p className="dashboardValue">
                {user?.isAccountVerified
                  ? "Verified account"
                  : "Verification pending"}
              </p>
              <p className="dashboardValue">Role: Community member</p>
            </div>

            <div className="card">
              <h3 className="dashboardCardTitle">Quick Actions</h3>
              <div className="formActions" style={{ marginTop: 10 }}>
                <Link to="/submit">
                  <button className="primary" type="button">
                    Submit Report
                  </button>
                </Link>
                <Link to="/problems">
                  <button className="secondary" type="button">
                    Browse Reports
                  </button>
                </Link>
                <Link to="/donate">
                  <button className="ghostBtn" type="button">
                    Donate
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="aboutCard" style={{ marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>Getting Started</h3>
            <p>
              Start by submitting a local issue with location details. You can then browse
              recent reports and support active work through donations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
