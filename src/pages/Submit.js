import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { createReport } from "../utils/reportStorage";

export default function Submit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const hasEmptyField = Object.values(formData).some((value) => !value.trim());
    if (hasEmptyField) {
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }

    createReport(formData);
    setSuccessMessage("Your problem has been submitted successfully.");
    setFormData({
      title: "",
      category: "",
      location: "",
      description: "",
    });
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Community reporting</div>

          <h1 className="title">
            Submit a <span className="glowText">Problem</span>
          </h1>

          <p className="subtitle">
            Share local issues with details so volunteers can review and act faster.
          </p>

          <div className="formCard">
            <form className="formGrid" onSubmit={handleSubmit}>
              <label>
                Problem title
                <input
                  type="text"
                  name="title"
                  placeholder="Example: Street light not working"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>

              <label>
                Category
                <input
                  type="text"
                  name="category"
                  placeholder="Example: Road, Lighting, Waste"
                  value={formData.category}
                  onChange={handleChange}
                />
              </label>

              <label className="fullWidth">
                Location
                <input
                  type="text"
                  name="location"
                  placeholder="Area, landmark, or full address"
                  value={formData.location}
                  onChange={handleChange}
                />
              </label>

              <label className="fullWidth">
                Description
                <textarea
                  rows={5}
                  name="description"
                  placeholder="Describe what is happening and how long the issue has existed."
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>

              {errorMessage ? <p className="messageError">{errorMessage}</p> : null}
              {successMessage ? <p className="messageSuccess">{successMessage}</p> : null}

              <div className="formActions fullWidth">
                <button className="primary" type="submit">
                  Submit Problem
                </button>
                <button className="secondary" type="button" onClick={() => navigate("/problems")}>
                  View Submitted Problems
                </button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/">
              <button className="secondary">&lt;- Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
