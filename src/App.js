import "./App.css";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Problems from "./pages/Problems";
import Signup from "./pages/Signup";
import Submit from "./pages/Submit";

function Landing() {
  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <header className="nav">
        <div className="brand">
          <span className="brandMark" aria-hidden="true">
            AB
          </span>
          <Link className="linkBtn logo" to="/">
            AlokBortika
          </Link>
        </div>

        <nav className="links">
          <Link className="linkBtn activeLink" to="/">
            Home
          </Link>
          <Link className="linkBtn" to="/submit">
            Submit Report
          </Link>
          <Link className="linkBtn" to="/problems">
            Browse Reports
          </Link>
        </nav>

        <div className="navActions">
          <Link to="/login">
            <button className="ghostBtn">Volunteer Login</button>
          </Link>
          <Link to="/login">
            <button className="ctaBtn">Admin Panel</button>
          </Link>
        </div>
      </header>

      <main className="hero">
        <div className="heroInner">
          <div className="heroSection">
            <div className="badge">For society, for you</div>

            <h1 className="title">
              Build a <span className="glowText">brighter future</span>
              <br />
              together.
            </h1>

            <p className="subtitle">
              Submit real community problems from your area. Verified volunteers and
              organizations will coordinate, update progress, and solve issues transparently.
            </p>

            <div className="actions">
              <Link to="/submit">
                <button className="primary">Submit a Problem</button>
              </Link>
              <Link to="/problems">
                <button className="secondary">Browse Problems</button>
              </Link>
              <Link to="/login">
                <button className="ghostBtn">Login</button>
              </Link>
            </div>
          </div>

          <section id="how" className="section">
            <div className="sectionHead">
              <h2>How it works</h2>
              <p>Simple steps. Clear progress. Real impact.</p>
            </div>

            <div className="cards">
              <div className="card">
                <div className="cardTop">
                  <span className="step">01</span>
                  <h3>Submit</h3>
                </div>
                <p>Describe your local issue with details, photos (optional), and location.</p>
              </div>

              <div className="card">
                <div className="cardTop">
                  <span className="step">02</span>
                  <h3>Volunteer review</h3>
                </div>
                <p>Verified volunteers and partner organizations review and pick up cases.</p>
              </div>

              <div className="card">
                <div className="cardTop">
                  <span className="step">03</span>
                  <h3>Solve together</h3>
                </div>
                <p>Coordinate updates, share progress, and mark issues resolved publicly.</p>
              </div>
            </div>
          </section>

          <section id="about" className="section">
            <div className="sectionHead">
              <h2>About</h2>
              <p>Why AlokBortika exists</p>
            </div>

            <div className="aboutCard">
              <p>
                AlokBortika connects citizens with local community problems to volunteers and
                organizations ready to help. Our mission is to make issue reporting simple,
                transparent, and collaborative so solutions can happen faster.
              </p>
            </div>
          </section>

          <section id="contact" className="section">
            <div className="sectionHead">
              <h2>Contact</h2>
              <p>Want to partner or volunteer? Let us talk.</p>
            </div>

            <div className="contactRow">
              <div className="miniCard">
                <h4>Email</h4>
                <p>prappopal@gmail.com</p>
              </div>
              <div className="miniCard">
                <h4>Phone</h4>
                <p>01992100882</p>
              </div>
              <div className="miniCard">
                <h4>Partners</h4>
                <p>NGOs and organizations welcome</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footerInner">
          <div>
            <p className="footerTitle">AlokBortika</p>
            <p>Building transparent community problem solving.</p>
          </div>
          <div>
            <p className="footerLabel">Contact</p>
            <p>Phone: 01992100882</p>
            <p>Email: prappopal@gmail.com</p>
          </div>
          <div>
            <p className="footerLabel">Quick Links</p>
            <p>
              <Link className="footerLink" to="/submit">
                Submit Report
              </Link>
            </p>
            <p>
              <Link className="footerLink" to="/problems">
                Browse Reports
              </Link>
            </p>
          </div>
        </div>
        <p className="copyright">
          Copyright {new Date().getFullYear()} AlokBortika. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/submit" element={<Submit />} />
      </Routes>
    </Router>
  );
}
