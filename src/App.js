import "./App.css";

function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="logo">AlokBortika</div>

        <nav className="links">
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main className="hero">
        <h1>Share local problems. Get help from volunteers.</h1>
        <p>
          AlokBortika is a platform where people submit real community issues and
          volunteers from organizations help solve them.
        </p>

        <div className="actions">
          <button className="primary">Submit a Problem</button>
          <button className="secondary">Browse Problems</button>
        </div>

        <section id="how" className="section">
          <h2>How it works</h2>

          <div className="cards">
            <div className="card">
              <h3>1) Submit</h3>
              <p>Describe your local issue with details and location.</p>
            </div>

            <div className="card">
              <h3>2) Volunteers view</h3>
              <p>Verified volunteers and organizations browse problems.</p>
            </div>

            <div className="card">
              <h3>3) Solve together</h3>
              <p>Coordinate, update progress, and mark problems resolved.</p>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <h2>About</h2>
          <p>
            AlokBortika is a community-based platform that helps connect people with local problems
            to volunteers and organizations ready to provide solutions. Our mission is to make local
            issue reporting simple, transparent, and collaborative.
            
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} AlokBortika </p>
      </footer>
    </div>
  );
}

export default App;
