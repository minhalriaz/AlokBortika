import { useEffect, useState } from "react";
import "./App.css";
import { Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Problems from "./pages/Problems";
import Signup from "./pages/Signup";
import Submit from "./pages/Submit";
import Donate from "./pages/Donate";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import VolunteerReviewPage from "./pages/VolunteerReviewPage";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import OrganizationLogin from "./pages/OrganizationLogin";
import OrganizationRegister from "./pages/OrganizationRegister";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import OrgProtectedRoute from "./components/OrgProtectedRoute";
import { Toaster } from "react-hot-toast";
import AdminProblems from "./pages/admin/AdminProblems";
function Landing({ theme, toggleTheme }) {
  const slides = [
    {
      title: "Local issues, community action",
      subtitle:
        "See nearby problems and let local volunteers solve them with real-time updates and clear results.",
      image:
        "https://img.freepik.com/premium-photo/friends-cleaning-recycling-with-people-beach-sustainability-environment-eco-friendly-climate-change-earth-day-nature-with-volunteer-community-service-pollution-plastic_590464-141559.jpg?w=2000",
    },
    {
      title: "Neighbors helping neighbors",
      subtitle:
        "Add a report, support someone in your neighborhood, and watch progress through verified volunteer activity.",
      image:
        "https://pbs.twimg.com/media/D6L0kz1V4AAziFY.jpg:large",
    },
    {
      title: "Impact that shows up locally",
      subtitle:
        "Build trust with transparent outcomes and community ratings for every completed issue.",
      image:
        "https://images.unsplash.com/photo-1584467735865-3ff816091e0e?auto=format&fit=crop&w=1400&q=80",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("Dhaka");

  const regionConfig = {
    Dhaka: {
      image:
        "https://www.shutterstock.com/shutterstock/videos/1098665261/thumb/1.jpg?ip=x480",
      solved: 140,
      volunteers: 68,
      organizations: 24,
      problems: [
        "Road pothole and flood control in Mirpur",
        "Trash disposal issue in Mohammadpur market",
        "Street light repairs in Uttara"
      ],
    },
    Chittagong: {
      image:
        "https://www.tbsnews.net/sites/default/files/styles/big_2/public/images/2024/09/23/whatsapp_image_2024-09-22_at_10.41.19_pm.jpeg",
      solved: 112,
      volunteers: 52,
      organizations: 18,
      problems: [
        "River cleanup at Patenga Beach",
        "Community park restoration in Agrabad",
        "Drainage fix in Anderkilla area"
      ],
    },
    Rangpur: {
      image:
        "https://friendship.ngo/wp-content/uploads/2023/06/Content_1-1024x576.jpg",
      solved: 95,
      volunteers: 44,
      organizations: 15,
      problems: [
        "Water pump installation in Pirganj",
        "School cleanup project in Rangpur city",
        "Flood support in Kaunia"
      ],
    },
    Sylhet: {
      image:
        "https://www.who.int/images/default-source/searo---images/countries/bangladesh/cxb/world-water-day--fs-cxb-who-ban-ta-(2).jpg?Status=Master&sfvrsn=a72bf5_7",
      solved: 56,
      volunteers: 29,
      organizations: 10,
      problems: [
        "Landslide prevention awareness in Jaintapur",
        "Water sanitation in Beanibazar",
        "Tree planting in Sylhet city"
      ],
    },
  };

  const selectedRegionData = regionConfig[selectedRegion];

  const regionBgImages = [
    "https://www.shutterstock.com/shutterstock/videos/1098665261/thumb/1.jpg?ip=x480",
    "https://www.tbsnews.net/sites/default/files/styles/big_2/public/images/2024/09/23/whatsapp_image_2024-09-22_at_10.41.19_pm.jpeg",
    "https://friendship.ngo/wp-content/uploads/2023/06/Content_1-1024x576.jpg",
    "https://www.who.int/images/default-source/searo---images/countries/bangladesh/cxb/world-water-day--fs-cxb-who-ban-ta-(2).jpg?Status=Master&sfvrsn=a72bf5_7",
  ];

  const [regionBgIndex, setRegionBgIndex] = useState(0);

  const homeBgImages = [
    "https://as2.ftcdn.net/v2/jpg/06/63/76/09/1000_F_663760963_jwqc4T3tkoOs7mHRuB2vmnAIEOeldlbC.jpg",
    "https://as2.ftcdn.net/v2/jpg/18/08/62/49/1000_F_1808624960_Ot7WWOPMvVuvds2z9jnZgWdVKvW51GDV.jpg",
    "https://img.freepik.com/premium-photo/volunteers-helping-after-natural-disaster_162575-2688.jpg",
    "https://static.wixstatic.com/media/f84ea2_cd40ae0269164cc59ee932f27e653a71~mv2.jpg/v1/fill/w_706,h_446,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20of%20church%20people%20helping%20during%20a%20natural%20disaster%20hurricane%20relief%20effort.jpg"
  ];

  const [homeBgIndex, setHomeBgIndex] = useState(0);

  useEffect(() => {
    const regionTimer = setInterval(() => {
      setRegionBgIndex((prev) => (prev + 1) % regionBgImages.length);
    }, 7000);

    return () => clearInterval(regionTimer);
  }, [regionBgImages.length]);

  useEffect(() => {
    const homeTimer = setInterval(() => {
      setHomeBgIndex((prev) => (prev + 1) % homeBgImages.length);
    }, 4000);

    return () => clearInterval(homeTimer);
  }, [homeBgImages.length]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setPrevSlide(activeSlide);
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(slideTimer);
  }, [slides.length, activeSlide]);

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <header className="nav">
        <div className="brand">
          <button
            type="button"
            className="brandMark"
            aria-pressed={theme === "dark"}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <span className="brandMarkDot" />
          </button>
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

          <Link className="linkBtn" to="/volunteer-reviews">
            Volunteer Reviews
          </Link>

          <Link className="linkBtn" to="/donate">
            Donate
          </Link>
        </nav>

        <div className="navActions">
          <Link to="/login">
            <button className="primary">Login</button>
          </Link>
        </div>
      </header>

      <main
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 17, 34, 0.45), rgba(6, 17, 34, 0.78)), url(${homeBgImages[homeBgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div className="heroBackground">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`heroSlide ${index === activeSlide ? "active" : ""} ${index === prevSlide ? "prev" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="heroSlideOverlay" />
              <div className="heroSlideContent">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="heroSlideDots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={index === activeSlide ? "active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

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
              <Link to="/donate">
                <button className="primary">Donate Now</button>
              </Link>
              <Link to="/login">
                <button className="ghostBtn">Login</button>
              </Link>
            </div>
          </div>

        </div>
      </main>

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
            <p>Describe your local issue with details, photos optional, and location.</p>
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

      <section
        id="regions"
        className="section regionSection"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 17, 34, 0.48), rgba(6, 17, 34, 0.84)), url(${regionBgImages[regionBgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="sectionHead">
          <h2>Explore by Region</h2>
          <p>Tap a city to see local solved problems and impact stories.</p>
        </div>

        <div className="regionFilterRow">
          {Object.keys(regionConfig).map((region) => (
            <button
              key={region}
              className={`regionChip ${selectedRegion === region ? "active" : ""}`}
              onClick={() => {
                setSelectedRegion(region);
                const regionSection = document.getElementById("regions");
                if (regionSection) {
                  regionSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="regionDetailGrid">
          <div className="regionImageCard">
            <img
              src={selectedRegionData.image}
              alt={`${selectedRegion} community`}
              className="regionImage"
            />
          </div>

          <div className="regionStatsCard">
            <div className="regionStat">
              <strong>{selectedRegionData.solved}</strong>
              <span>Solved problems</span>
            </div>
            <div className="regionStat">
              <strong>{selectedRegionData.volunteers}</strong>
              <span>Active volunteers</span>
            </div>
            <div className="regionStat">
              <strong>{selectedRegionData.organizations}</strong>
              <span>Organizations partnered</span>
            </div>

            <div className="regionProblemList">
              <h4>Recent solved tasks</h4>
              <ul>
                {selectedRegionData.problems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
              <Link className="footerLink" to="/donate">
                Donate
              </Link>
            </p>
            <p>

              <Link className="footerLink" to="/volunteer-reviews">
                Volunteer Reviews
              </Link>
            </p>
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
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("alokbortika-theme");
    const nextTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("alokbortika-theme", nextTheme);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/submit" element={<Submit />} />

        <Route path="/donate" element={<Donate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/volunteer-reviews" element={<VolunteerReviewPage />} />
        <Route path="/organization-dashboard" element={<OrgProtectedRoute><OrganizationDashboard /></OrgProtectedRoute>} />
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/register" element={<OrganizationRegister />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOpportunities /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer-profile" element={<VolunteerProfile />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOpportunities /></ProtectedRoute>} />
        <Route path="/admin/organizations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrganizations /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/problems" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProblems /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
