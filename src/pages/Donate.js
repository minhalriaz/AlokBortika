import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import donationService from "../services/donationService";

const initialFormData = {
  donorName: "",
  donorEmail: "",
  donorPhone: "",
  amount: "",
  paymentMethod: "bKash",
  transactionId: "",
  note: "",
  isAnonymous: false,
};

function formatCurrency(amount, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

export default function Donate() {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [stats, setStats] = useState({
    totalAmount: 0,
    donorCount: 0,
    monthAmount: 0,
    recentDonations: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCurrency = useMemo(
    () => stats.recentDonations[0]?.currency || "BDT",
    [stats.recentDonations]
  );

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const response = await donationService.getDonationStats();
        if (mounted && response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        // Keep the page usable even if stats fail.
      } finally {
        if (mounted) {
          setIsLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !formData.donorName.trim() ||
      !formData.donorEmail.trim() ||
      !formData.amount ||
      !formData.paymentMethod
    ) {
      setErrorMessage("Please fill in name, email, amount, and payment method.");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setErrorMessage("Donation amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await donationService.createDonation({
        ...formData,
        amount: Number(formData.amount),
      });

      if (!response.success) {
        setErrorMessage(response.message || "Failed to submit donation.");
        return;
      }

      setSuccessMessage(
        `Thank you for supporting AlokBortika. Receipt ID: ${response.donation.id}`
      );
      setFormData(initialFormData);

      const statsResponse = await donationService.getDonationStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to submit donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Support the mission</div>
          <h1 className="title">
            Donate to <span className="glowText">AlokBortika</span>
          </h1>
          <p className="subtitle">
            Anyone can contribute. Your donation helps volunteers respond faster to
            real community problems.
          </p>

          <div className="cards">
            <div className="card">
              <div className="cardTop">
                <h3>Total Donations</h3>
              </div>
              <p>
                {isLoadingStats
                  ? "Loading..."
                  : formatCurrency(stats.totalAmount, defaultCurrency)}
              </p>
            </div>
            <div className="card">
              <div className="cardTop">
                <h3>Total Donors</h3>
              </div>
              <p>{isLoadingStats ? "Loading..." : stats.donorCount}</p>
            </div>
            <div className="card">
              <div className="cardTop">
                <h3>This Month</h3>
              </div>
              <p>
                {isLoadingStats
                  ? "Loading..."
                  : formatCurrency(stats.monthAmount, defaultCurrency)}
              </p>
            </div>
          </div>

          <div className="formCard" style={{ marginTop: 20 }}>
            <form className="formGrid" onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  type="text"
                  name="donorName"
                  placeholder="Your full name"
                  value={formData.donorName}
                  onChange={handleChange}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="donorEmail"
                  placeholder="your@email.com"
                  value={formData.donorEmail}
                  onChange={handleChange}
                />
              </label>

              <label>
                Phone (optional)
                <input
                  type="text"
                  name="donorPhone"
                  placeholder="01XXXXXXXXX"
                  value={formData.donorPhone}
                  onChange={handleChange}
                />
              </label>

              <label>
                Amount (BDT)
                <input
                  type="number"
                  name="amount"
                  min="1"
                  placeholder="e.g. 500"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </label>

              <label>
                Payment method
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </label>

              <label>
                Transaction ID (optional)
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Wallet trxID / bank reference"
                  value={formData.transactionId}
                  onChange={handleChange}
                />
              </label>

              <label className="fullWidth">
                Note (optional)
                <textarea
                  rows={4}
                  name="note"
                  placeholder="Anything you want us to know"
                  value={formData.note}
                  onChange={handleChange}
                />
              </label>

              <label className="fullWidth" style={{ alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    style={{ width: "auto" }}
                  />
                  <span>Show me as anonymous in recent donations</span>
                </div>
              </label>

              {errorMessage ? <p className="messageError">{errorMessage}</p> : null}
              {successMessage ? <p className="messageSuccess">{successMessage}</p> : null}

              <div className="formActions fullWidth">
                <button className="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Donation"}
                </button>
                <Link to="/">
                  <button className="secondary" type="button">
                    Back to Home
                  </button>
                </Link>
              </div>
            </form>
          </div>

          <div className="aboutCard" style={{ marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>Recent Donations</h3>
            {stats.recentDonations.length === 0 ? (
              <p>No donations yet. Be the first supporter.</p>
            ) : (
              <div className="cards" style={{ marginTop: 10 }}>
                {stats.recentDonations.map((donation) => (
                  <div className="card" key={donation.id}>
                    <div className="cardTop">
                      <h3>{donation.donorName}</h3>
                      <span className="status statusResolved">
                        {formatCurrency(donation.amount, donation.currency)}
                      </span>
                    </div>
                    <p>Donated: {formatDate(donation.donatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
