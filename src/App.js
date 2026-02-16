import "./App.css";

function App() {
  return (
    <div className="page">
      {/* Top glow background layers */}
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <header className="nav">
        <div className="brand">
          <span className="brandMark" aria-hidden="true">📍</span>
          <span className="logo">AlokBortika</span>
        </div>

        <nav className="links">
          <a href="#how">How it works</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="navActions">
          <button className="ghostBtn">Volunteer Login</button>
          <button className="ctaBtn">Admin Panel</button>
        </div>
      </header>

      <main className="hero">
        <div className="heroInner">
          <div className="badge">For society, for you</div>

          <h1 className="title">
            Build a <span className="glowText">brighter future</span>
            <br />
            together.
          </h1>

          <p className="subtitle">
            Submit real community problems from your area. Verified volunteers and organizations
            will coordinate, update progress, and solve issues transparently.
          </p>

          <div className="actions">
            <button className="primary">Submit a Problem</button>
            <button className="secondary">Browse Problems</button>
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
                transparent, and collaborative — so solutions can happen faster.
              </p>
            </div>
          </section>

          <section id="contact" className="section">
            <div className="sectionHead">
              <h2>Contact</h2>
              <p>Want to partner or volunteer? Let’s talk.</p>
            </div>

            <div className="contactRow">
              <div className="miniCard">
                <h4>Email</h4>
                <p>support@alokbortika.com</p>
              </div>
              <div className="miniCard">
                <h4>Community</h4>
                <p>Join as a verified volunteer</p>
              </div>
              <div className="miniCard">
                <h4>Partners</h4>
                <p>NGOs & Organizations welcome</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} AlokBortika • Built for community impact</p>
      </footer>
    </div>
  );
}

export default App;
