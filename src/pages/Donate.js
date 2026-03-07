import { useMemo, useRef, useState } from "react";
import "../App.css";
import "./Donate.css";

const IMPACT_ITEMS = [
  {
    id: "roads",
    icon: "RD",
    title: "Repair damaged roads",
    description:
      "Donations help fund quick repairs for potholes and damaged roads that affect daily travel.",
  },
  {
    id: "waste",
    icon: "WM",
    title: "Improve waste management",
    description:
      "Support cleaner neighborhoods through waste collection drives and local cleanup initiatives.",
  },
  {
    id: "lighting",
    icon: "SL",
    title: "Fix street lighting",
    description:
      "Better street lighting improves visibility and safety for students, workers, and families.",
  },
  {
    id: "volunteers",
    icon: "SV",
    title: "Support volunteers",
    description:
      "Enable volunteers with basic tools, transport support, and resources for faster community action.",
  },
];

const INITIAL_CAMPAIGNS = [
  {
    id: "street-light-repair",
    title: "Street Light Repair Fund",
    description:
      "Replace broken lights in dark roads and alleyways to improve safety at night.",
    targetAmount: 100000,
    raisedAmount: 42000,
  },
  {
    id: "clean-neighborhood",
    title: "Clean Neighborhood Initiative",
    description:
      "Support regular cleanup, proper waste bins, and awareness campaigns in local areas.",
    targetAmount: 80000,
    raisedAmount: 28600,
  },
  {
    id: "emergency-road",
    title: "Emergency Road Repair",
    description:
      "Provide urgent temporary fixes for dangerous road damage before major accidents happen.",
    targetAmount: 120000,
    raisedAmount: 53000,
  },
  {
    id: "safe-community",
    title: "Safe Community Support",
    description:
      "Help community volunteers respond to urgent safety and local infrastructure issues.",
    targetAmount: 90000,
    raisedAmount: 31800,
  },
];

const INITIAL_DONATIONS = [
  {
    id: "d1",
    donorName: "Mahin Rahman",
    isAnonymous: false,
    amount: 1000,
    campaignId: "street-light-repair",
    campaignTitle: "Street Light Repair Fund",
    donatedAt: "2026-03-01T16:20:00.000Z",
  },
  {
    id: "d2",
    donorName: "Anonymous",
    isAnonymous: true,
    amount: 500,
    campaignId: "clean-neighborhood",
    campaignTitle: "Clean Neighborhood Initiative",
    donatedAt: "2026-03-02T11:45:00.000Z",
  },
  {
    id: "d3",
    donorName: "Nabila Sultana",
    isAnonymous: false,
    amount: 2000,
    campaignId: "emergency-road",
    campaignTitle: "Emergency Road Repair",
    donatedAt: "2026-03-03T09:10:00.000Z",
  },
];

const PRESET_AMOUNTS = [100, 500, 1000];

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Visa, MasterCard, or any supported bank card.",
  },
  {
    id: "bkash",
    label: "bKash",
    description: "Fast mobile payment for Bangladeshi users.",
  },
  {
    id: "nagad",
    label: "Nagad",
    description: "Send payment using Nagad mobile wallet.",
  },
  {
    id: "rocket",
    label: "Rocket",
    description: "Pay through Rocket digital payment service.",
  },
];

const INITIAL_FORM = {
  donorName: "",
  donorPhone: "",
  email: "",
  amount: "",
  paymentMethod: "bkash",
  transactionId: "",
  note: "",
  isAnonymous: false,
  campaignId: INITIAL_CAMPAIGNS[0].id,
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
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getProgressPercent(raisedAmount, targetAmount) {
  if (!targetAmount) return 0;
  return Math.min(100, Math.round((raisedAmount / targetAmount) * 100));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function CampaignCard({ campaign, onDonateClick }) {
  const progress = getProgressPercent(campaign.raisedAmount, campaign.targetAmount);

  return (
    <article className="donate-campaign-card">
      <h3>{campaign.title}</h3>
      <p>{campaign.description}</p>

      <div className="donate-campaign-stats">
        <span>
          <strong>Target:</strong> {formatCurrency(campaign.targetAmount)}
        </span>
        <span>
          <strong>Raised:</strong> {formatCurrency(campaign.raisedAmount)}
        </span>
      </div>

      <div className="donate-progress-track" aria-label={`${campaign.title} progress`}>
        <div className="donate-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <p className="donate-progress-text">{progress}% funded</p>

      <button
        className="donate-btn donate-btn-primary"
        type="button"
        onClick={() => onDonateClick(campaign.id)}
      >
        Donate to This Campaign
      </button>
    </article>
  );
}

function RecentDonationItem({ donation }) {
  return (
    <li className="donate-recent-item">
      <div>
        <h4>{donation.isAnonymous ? "Anonymous" : donation.donorName}</h4>
        <p>{donation.campaignTitle}</p>
      </div>
      <div className="donate-recent-meta">
        <strong>{formatCurrency(donation.amount)}</strong>
        <span>{formatDate(donation.donatedAt)}</span>
      </div>
    </li>
  );
}

export default function Donate() {
  const formSectionRef = useRef(null);

  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [recentDonations, setRecentDonations] = useState(INITIAL_DONATIONS);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedAmountType, setSelectedAmountType] = useState("custom");
  const [errors, setErrors] = useState({});
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === formData.campaignId),
    [campaigns, formData.campaignId]
  );

  const totalRaised = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.raisedAmount, 0),
    [campaigns]
  );

  const totalTarget = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.targetAmount, 0),
    [campaigns]
  );

  const totalProgress = getProgressPercent(totalRaised, totalTarget);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const amountValue = Number(formData.amount);

    if (!formData.donorName.trim()) {
      nextErrors.donorName = "Donor name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.campaignId) {
      nextErrors.campaignId = "Please select a campaign.";
    }

    if (!formData.amount) {
      nextErrors.amount = "Donation amount is required.";
    } else if (Number.isNaN(amountValue) || amountValue <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    }

    if (!formData.paymentMethod) {
      nextErrors.paymentMethod = "Please choose a payment method.";
    }

    return { nextErrors, amountValue };
  };

  const handleAmountPreset = (amount) => {
    setSelectedAmountType(String(amount));
    setFormData((prev) => ({
      ...prev,
      amount: String(amount),
    }));
  };

  const handleCustomAmount = () => {
    setSelectedAmountType("custom");
    setFormData((prev) => ({
      ...prev,
      amount: "",
    }));
  };

  const focusForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCampaignDonateClick = (campaignId) => {
    setFormData((prev) => ({
      ...prev,
      campaignId,
    }));
    setThankYouMessage("");
    focusForm();
  };

  const handleOpenPayment = (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { nextErrors, amountValue } = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPaymentDraft({
      donorName: formData.donorName.trim(),
      email: formData.email.trim(),
      amount: amountValue,
      isAnonymous: formData.isAnonymous,
      campaignId: formData.campaignId,
      campaignTitle: selectedCampaign ? selectedCampaign.title : "Community Campaign",
      paymentMethod: formData.paymentMethod,
    });
  };

  const handleCancelPayment = () => {
    if (!isProcessingPayment) {
      setPaymentDraft(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentDraft) return;

    setIsProcessingPayment(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (campaign.id !== paymentDraft.campaignId) return campaign;

          return {
            ...campaign,
            raisedAmount: campaign.raisedAmount + paymentDraft.amount,
          };
        })
      );

      const newDonation = {
        id: `${Date.now()}`,
        donorName: paymentDraft.donorName,
        isAnonymous: paymentDraft.isAnonymous,
        amount: paymentDraft.amount,
        campaignId: paymentDraft.campaignId,
        campaignTitle: paymentDraft.campaignTitle,
        donatedAt: new Date().toISOString(),
      };

      setRecentDonations((prev) => [newDonation, ...prev]);
      setFormData(INITIAL_FORM);
      setSelectedAmountType("custom");
      setErrors({});
      setPaymentDraft(null);

      setThankYouMessage(
        "Thank you for supporting your community. Your contribution helps solve real local problems."
      );

      setSuccessMessage("Donation submitted successfully.");
    } catch (error) {
      setErrorMessage("Failed to submit donation.");
    } finally {
      setIsProcessingPayment(false);
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
          <button className="donate-btn donate-btn-primary" type="button" onClick={focusForm}>
            Donate Now
          </button>
        </div>
      </div>

      <section className="donate-shell donate-section">
        <div className="donate-section-head">
          <h2>Why Donate</h2>
          <p>Your support creates direct impact where people need it most.</p>
        </div>

        <div className="donate-impact-grid">
          {IMPACT_ITEMS.map((item) => (
            <article key={item.id} className="donate-impact-card">
              <div className="donate-impact-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="donate-shell donate-section">
        <div className="donate-section-head">
          <h2>Active Campaigns</h2>
          <p>Choose a local cause and contribute directly to ongoing community work.</p>
        </div>

        <div className="donate-campaign-grid">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDonateClick={handleCampaignDonateClick}
            />
          ))}
        </div>
      </section>

      <form className="donate-shell donate-form-shell" onSubmit={handleOpenPayment} noValidate>
        <section className="donate-section donate-form-section" ref={formSectionRef}>
          <div className="donate-section-head">
            <h2>Donation Form</h2>
            <p>Fill in your details and choose how much you want to contribute.</p>
          </div>

          <div className="donate-form-grid">
            <label htmlFor="donorName">
              Donor Name
              <input
                id="donorName"
                name="donorName"
                type="text"
                placeholder="Enter your name"
                value={formData.donorName}
                onChange={handleInputChange}
              />
              {errors.donorName && (
                <span className="donate-input-error">{errors.donorName}</span>
              )}
            </label>

            <label htmlFor="email">
              Email
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <span className="donate-input-error">{errors.email}</span>}
            </label>

            <label htmlFor="donorPhone">
              Phone (optional)
              <input
                id="donorPhone"
                name="donorPhone"
                type="text"
                placeholder="01XXXXXXXXX"
                value={formData.donorPhone}
                onChange={handleInputChange}
              />
            </label>

            <label htmlFor="campaignId">
              Select Campaign
              <select
                id="campaignId"
                name="campaignId"
                value={formData.campaignId}
                onChange={handleInputChange}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
              {errors.campaignId && (
                <span className="donate-input-error">{errors.campaignId}</span>
              )}
            </label>

            <div className="donate-amount-block">
              <h3>Choose Donation Amount</h3>

              <div className="donate-amount-buttons">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`donate-btn donate-btn-amount ${
                      selectedAmountType === String(amount) ? "active" : ""
                    }`}
                    onClick={() => handleAmountPreset(amount)}
                  >
                    {amount}
                  </button>
                ))}

                <button
                  type="button"
                  className={`donate-btn donate-btn-amount ${
                    selectedAmountType === "custom" ? "active" : ""
                  }`}
                  onClick={handleCustomAmount}
                >
                  Custom
                </button>
              </div>

              <label htmlFor="amount" className="donate-amount-input">
                Donation Amount (BDT)
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
                {errors.amount && <span className="donate-input-error">{errors.amount}</span>}
              </label>

              <label className="donate-checkbox">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                />
                Donate anonymously
              </label>
            </div>
          </div>
        </section>

        <section className="donate-section donate-payment-section">
          <div className="donate-section-head">
            <h2>Online Donation System</h2>
            <p>
              This is a simulated payment flow for now. You can connect a real payment
              gateway later.
            </p>
          </div>

          <div className="donate-payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`donate-payment-method ${
                  formData.paymentMethod === method.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={formData.paymentMethod === method.id}
                  onChange={handleInputChange}
                />
                <div>
                  <h4>{method.label}</h4>
                  <p>{method.description}</p>
                </div>
              </label>
            ))}
          </div>

          {errors.paymentMethod && (
            <span className="donate-input-error donate-top-gap">
              {errors.paymentMethod}
            </span>
          )}

          <label className="fullWidth">
            Transaction ID (optional)
            <input
              type="text"
              name="transactionId"
              placeholder="Wallet trxID / bank reference"
              value={formData.transactionId}
              onChange={handleInputChange}
            />
          </label>

          <label className="fullWidth">
            Note (optional)
            <textarea
              rows={4}
              name="note"
              placeholder="Anything you want us to know"
              value={formData.note}
              onChange={handleInputChange}
            />
          </label>

          <div className="donate-payment-summary">
            <h3>Payment Summary</h3>
            <p>
              <strong>Campaign:</strong>{" "}
              {selectedCampaign ? selectedCampaign.title : "Not selected"}
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(Number(formData.amount) || 0)}
            </p>
            <p>
              <strong>Method:</strong>{" "}
              {PAYMENT_METHODS.find((method) => method.id === formData.paymentMethod)?.label ||
                "Not selected"}
            </p>
          </div>

          <button
            type="submit"
            className="donate-btn donate-btn-primary donate-submit-btn"
          >
            Proceed to Donate
          </button>

          {errorMessage && <p className="messageError">{errorMessage}</p>}
          {successMessage && <p className="messageSuccess">{successMessage}</p>}
        </section>
      </form>

      <section className="donate-shell donate-section">
        <div className="donate-section-head">
          <h2>Donation Progress</h2>
          <p>Track how close the community is to achieving all active campaign goals.</p>
        </div>

        <article className="donate-total-progress-card">
          <div className="donate-total-progress-stats">
            <div>
              <span>Total Raised</span>
              <strong>{formatCurrency(totalRaised)}</strong>
            </div>
            <div>
              <span>Total Target</span>
              <strong>{formatCurrency(totalTarget)}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{totalProgress}%</strong>
            </div>
          </div>

          <div className="donate-progress-track" aria-label="Total donation progress">
            <div
              className="donate-progress-fill donate-progress-fill-total"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </article>
      </section>

      <section className="donate-shell donate-section">
        <div className="donate-section-head">
          <h2>Recent Donations</h2>
          <p>Latest supporters who are helping solve local problems.</p>
        </div>

        <ul className="donate-recent-list">
          {recentDonations.map((donation) => (
            <RecentDonationItem key={donation.id} donation={donation} />
          ))}
        </ul>
      </section>

      {thankYouMessage && (
        <section className="donate-shell donate-section donate-thank-you">
          <h2>Thank You Message</h2>
          <p>{thankYouMessage}</p>
        </section>
      )}

      {paymentDraft && (
        <div className="donate-modal-backdrop" role="presentation">
          <section
            className="donate-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Simulated payment"
          >
            <h3>Confirm Donation</h3>
            <p>This payment is simulated for the university project demo.</p>

            <div className="donate-modal-summary">
              <p>
                <strong>Donor:</strong>{" "}
                {paymentDraft.isAnonymous ? "Anonymous" : paymentDraft.donorName}
              </p>
              <p>
                <strong>Campaign:</strong> {paymentDraft.campaignTitle}
              </p>
              <p>
                <strong>Amount:</strong> {formatCurrency(paymentDraft.amount)}
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {PAYMENT_METHODS.find(
                  (method) => method.id === paymentDraft.paymentMethod
                )?.label}
              </p>
            </div>

            <div className="donate-modal-actions">
              <button
                className="donate-btn donate-btn-secondary"
                type="button"
                onClick={handleCancelPayment}
                disabled={isProcessingPayment}
              >
                Cancel
              </button>

              <button
                className="donate-btn donate-btn-primary"
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing Payment..." : "Pay Now (Simulated)"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}