import donationModel from "./donation.model.js";
import mongoose from "mongoose";

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  Card: "Card",
  bkash: "bKash",
  bKash: "bKash",
  nagad: "Nagad",
  Nagad: "Nagad",
  rocket: "Rocket",
  Rocket: "Rocket",
  cash: "Cash",
  Cash: "Cash",
  "bank-transfer": "Bank Transfer",
  bank_transfer: "Bank Transfer",
  "Bank Transfer": "Bank Transfer",
};

const allowedPaymentMethods = [
  "Card",
  "bKash",
  "Nagad",
  "Rocket",
  "Bank Transfer",
  "Cash",
];

const inMemoryDonations = [];

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function normalizePaymentMethod(method) {
  if (!method) return null;
  return PAYMENT_METHOD_LABELS[method] || null;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function sanitizeMetadataValue(value) {
  return String(value || "").slice(0, 500);
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

function createInMemoryDonation(payload) {
  const now = new Date();
  const donation = {
    _id: `mem_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    donorName: payload.donorName || "Anonymous Donor",
    donorEmail: payload.donorEmail || "",
    donorPhone: payload.donorPhone || "",
    campaignId: payload.campaignId || "",
    campaignTitle: payload.campaignTitle || "Community Campaign",
    amount: Number(payload.amount) || 0,
    currency: (payload.currency || "BDT").toUpperCase(),
    paymentMethod: payload.paymentMethod || "Card",
    paymentGateway: payload.paymentGateway || "Manual",
    transactionId: payload.transactionId || "",
    stripeSessionId: payload.stripeSessionId || "",
    note: payload.note || "",
    isAnonymous: normalizeBoolean(payload.isAnonymous),
    status: payload.status || "Pending Verification",
    donatedAt: payload.donatedAt || now,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryDonations.unshift(donation);
  return donation;
}

function findInMemoryDonationBySessionId(sessionId) {
  return inMemoryDonations.find((item) => item.stripeSessionId === sessionId);
}

function getInMemoryDonationStats() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const totalAmount = inMemoryDonations.reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );
  const donorCount = inMemoryDonations.length;
  const monthAmount = inMemoryDonations
    .filter((donation) => new Date(donation.donatedAt) >= monthStart)
    .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);

  const recentDonations = [...inMemoryDonations]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.donatedAt) - new Date(a.createdAt || a.donatedAt)
    )
    .slice(0, 5);

  return {
    totalAmount,
    donorCount,
    monthAmount,
    recentDonations,
  };
}

async function stripeRequest(path, { method = "GET", params } = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const url = `https://api.stripe.com/v1${path}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  };

  if (params) {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = params.toString();
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message || "Stripe request failed. Please try again.";
    throw new Error(message);
  }

  return data;
}

function formatDonationResponse(donation) {
  return {
    id: donation._id,
    donorName: donation.isAnonymous ? "Anonymous" : donation.donorName,
    amount: donation.amount,
    currency: donation.currency,
    status: donation.status,
    paymentMethod: donation.paymentMethod,
    campaignId: donation.campaignId,
    campaignTitle: donation.campaignTitle,
    donatedAt: donation.donatedAt,
  };
}

export const createDonation = async (req, res) => {
  const {
    donorName,
    donorPhone,
    amount,
    paymentMethod,
    transactionId,
    note,
    isAnonymous,
    campaignId,
    campaignTitle,
  } = req.body;

  const donorEmail = req.body.donorEmail || req.body.email;
  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  if (!donorName || !donorEmail || !amount || !normalizedMethod) {
    return res.json({
      success: false,
      message: "Donor name, email, amount, and payment method are required",
    });
  }

  if (!isValidEmail(donorEmail)) {
    return res.json({ success: false, message: "Please enter a valid email" });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.json({
      success: false,
      message: "Donation amount must be greater than 0",
    });
  }

  if (!allowedPaymentMethods.includes(normalizedMethod)) {
    return res.json({ success: false, message: "Invalid payment method" });
  }

  try {
    const donationPayload = {
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone?.trim() || "",
      campaignId: campaignId?.trim() || "",
      campaignTitle: campaignTitle?.trim() || "",
      amount: parsedAmount,
      paymentMethod: normalizedMethod,
      paymentGateway: "Manual",
      transactionId: transactionId?.trim() || "",
      note: note?.trim() || "",
      isAnonymous: normalizeBoolean(isAnonymous),
      status: transactionId ? "Received" : "Pending Verification",
    };

    const donation = isDatabaseConnected()
      ? await donationModel.create(donationPayload)
      : createInMemoryDonation(donationPayload);

    return res.json({
      success: true,
      message: "Thank you. Your donation has been recorded.",
      donation: formatDonationResponse(donation),
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const createStripeCheckoutSession = async (req, res) => {
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    campaignId,
    campaignTitle,
    note,
    isAnonymous,
  } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      message: "Stripe key is not configured on server.",
    });
  }

  if (!donorName || !donorEmail || !amount) {
    return res.status(400).json({
      success: false,
      message: "Donor name, email, and amount are required.",
    });
  }

  if (!isValidEmail(donorEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email.",
    });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Donation amount must be greater than 0.",
    });
  }

  const amountInMinor = Math.round(parsedAmount * 100);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${clientUrl}/donate?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${clientUrl}/donate?payment=cancelled`);
  params.set("payment_method_types[0]", "card");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "bdt");
  params.set("line_items[0][price_data][unit_amount]", String(amountInMinor));
  params.set(
    "line_items[0][price_data][product_data][name]",
    `Donation - ${campaignTitle || "AlokBortika"}`
  );
  params.set(
    "line_items[0][price_data][product_data][description]",
    "Community donation for local problem solving."
  );
  params.set("customer_email", donorEmail.trim());
  params.set("metadata[donorName]", sanitizeMetadataValue(donorName));
  params.set("metadata[donorEmail]", sanitizeMetadataValue(donorEmail));
  params.set("metadata[donorPhone]", sanitizeMetadataValue(donorPhone));
  params.set("metadata[campaignId]", sanitizeMetadataValue(campaignId));
  params.set("metadata[campaignTitle]", sanitizeMetadataValue(campaignTitle));
  params.set("metadata[note]", sanitizeMetadataValue(note));
  params.set("metadata[isAnonymous]", String(normalizeBoolean(isAnonymous)));
  params.set("metadata[paymentMethod]", "Card");

  try {
    const session = await stripeRequest("/checkout/sessions", {
      method: "POST",
      params,
    });

    return res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyStripeCheckoutSession = async (req, res) => {
  const { sessionId } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      message: "Stripe key is not configured on server.",
    });
  }

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session id is required.",
    });
  }

  try {
    const session = await stripeRequest(`/checkout/sessions/${sessionId}`, {
      method: "GET",
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is not completed yet.",
      });
    }

    const existingDonation = isDatabaseConnected()
      ? await donationModel.findOne({ stripeSessionId: session.id })
      : findInMemoryDonationBySessionId(session.id);

    if (existingDonation) {
      return res.json({
        success: true,
        message: "Payment already verified.",
        donation: formatDonationResponse(existingDonation),
      });
    }

    const metadata = session.metadata || {};
    const donorEmail =
      session.customer_details?.email ||
      session.customer_email ||
      metadata.donorEmail;
    const donorName = metadata.donorName || donorEmail || "Anonymous Donor";

    if (!donorEmail) {
      return res.status(400).json({
        success: false,
        message: "Unable to verify donor email from payment gateway.",
      });
    }

    const donationPayload = {
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: metadata.donorPhone || "",
      campaignId: metadata.campaignId || "",
      campaignTitle: metadata.campaignTitle || "Community Campaign",
      amount: Number(session.amount_total || 0) / 100,
      currency: (session.currency || "BDT").toUpperCase(),
      paymentMethod: normalizePaymentMethod(metadata.paymentMethod) || "Card",
      paymentGateway: "Stripe Checkout",
      transactionId: session.payment_intent || session.id,
      stripeSessionId: session.id,
      note: metadata.note || "",
      isAnonymous: normalizeBoolean(metadata.isAnonymous),
      status: "Received",
    };

    const donation = isDatabaseConnected()
      ? await donationModel.create(donationPayload)
      : createInMemoryDonation(donationPayload);

    return res.json({
      success: true,
      message: "Payment verified and donation recorded.",
      donation: formatDonationResponse(donation),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getDonationStats = async (_req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const stats = getInMemoryDonationStats();
      return res.json({
        success: true,
        stats: {
          totalAmount: stats.totalAmount,
          donorCount: stats.donorCount,
          monthAmount: stats.monthAmount,
          recentDonations: stats.recentDonations.map((donation) => ({
            id: donation._id,
            donorName: donation.isAnonymous ? "Anonymous" : donation.donorName,
            amount: donation.amount,
            currency: donation.currency,
            donatedAt: donation.donatedAt,
            campaignId: donation.campaignId,
            campaignTitle: donation.campaignTitle,
            paymentMethod: donation.paymentMethod,
            status: donation.status,
          })),
        },
      });
    }

    const [totals, monthTotals, recentDonations] = await Promise.all([
      donationModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            donorCount: { $sum: 1 },
          },
        },
      ]),
      donationModel.aggregate([
        {
          $match: {
            donatedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            monthAmount: { $sum: "$amount" },
          },
        },
      ]),
      donationModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "donorName amount currency isAnonymous donatedAt campaignId campaignTitle paymentMethod status"
        ),
    ]);

    const totalAmount = totals[0]?.totalAmount || 0;
    const donorCount = totals[0]?.donorCount || 0;
    const monthAmount = monthTotals[0]?.monthAmount || 0;

    return res.json({
      success: true,
      stats: {
        totalAmount,
        donorCount,
        monthAmount,
        recentDonations: recentDonations.map((donation) => ({
          id: donation._id,
          donorName: donation.isAnonymous ? "Anonymous" : donation.donorName,
          amount: donation.amount,
          currency: donation.currency,
          donatedAt: donation.donatedAt,
          campaignId: donation.campaignId,
          campaignTitle: donation.campaignTitle,
          paymentMethod: donation.paymentMethod,
          status: donation.status,
        })),
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
