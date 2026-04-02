import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import api from "../api/api";

export default function Submit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
    organizationId: "",
  });

  const [organizations, setOrganizations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get("/problem/organizations");
        if (response.data.success) {
          setOrganizations(response.data.organizations);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setFetchingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const hasEmptyRequiredField =
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.location.trim() ||
      !formData.description.trim() ||
      !formData.organizationId.trim();

    if (hasEmptyRequiredField) {
      setErrorMessage("Please fill in all required fields before submitting.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/problem/create", {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        organizationId: formData.organizationId,
      });

      if (response.data.success) {
        setSuccessMessage("Your problem has been submitted successfully.");
        setFormData({
          title: "",
          category: "",
          location: "",
          description: "",
          organizationId: "",
        });
      } else {
        setErrorMessage(response.data.message || "Failed to submit problem.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong while submitting."
      );
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </label>

              <label className="fullWidth">
                Organization <span style={{ color: "red" }}>*</span>
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  disabled={loading || fetchingOrgs}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#000",
                    cursor: fetchingOrgs ? "wait" : "pointer",
                  }}
                >
                  <option value="">
                    {fetchingOrgs ? "Loading organizations..." : "Select an organization"}
                  </option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="fullWidth">
                Description
                <textarea
                  rows={5}
                  name="description"
                  placeholder="Describe what is happening and how long the issue has existed."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>

              {errorMessage ? <p className="messageError">{errorMessage}</p> : null}
              {successMessage ? <p className="messageSuccess">{successMessage}</p> : null}

              <div className="formActions fullWidth">
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Problem"}
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={() => navigate("/problems")}
                  disabled={loading}
                >
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