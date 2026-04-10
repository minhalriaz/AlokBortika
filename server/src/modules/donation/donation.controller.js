import donationModel from "./donation.model.js";
import mongoose from "mongoose";
import SSLCommerzPayment from "sslcommerz-lts";

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

function updateInMemoryDonationStatus(transactionId, status) {
  const donation = inMemoryDonations.find(
    (item) => item.transactionId === transactionId
  );

  if (donation) {
    donation.status = status;
    donation.updatedAt = new Date();
    if (status === "Received") {
      donation.donatedAt = new Date();
    }
  }

  return donation;
}

function getInMemoryDonationStats() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const successfulDonations = inMemoryDonations.filter(
    (donation) => donation.status === "Received"
  );

  const totalAmount = successfulDonations.reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );

  const donorCount = successfulDonations.length;

  const monthAmount = successfulDonations
    .filter((donation) => new Date(donation.donatedAt) >= monthStart)
    .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);

  const recentDonations = [...successfulDonations]
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
    transactionId: donation.transactionId,
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
      donatedAt: transactionId ? new Date() : null,
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

export const initSSLCommerzPayment = async (req, res) => {
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

  if (!process.env.SSL_STORE_ID || !process.env.SSL_STORE_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: "SSLCommerz is not configured on server.",
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

  try {
    const transactionId = `DON-${Date.now()}`;
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5000/api";

    const donationPayload = {
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone?.trim() || "",
      campaignId: campaignId?.trim() || "",
      campaignTitle: campaignTitle?.trim() || "AlokBortika",
      amount: parsedAmount,
      currency: "BDT",
      paymentMethod: "Card",
      paymentGateway: "SSLCommerz",
      transactionId,
      note: note?.trim() || "",
      isAnonymous: normalizeBoolean(isAnonymous),
      status: "Pending",
    };

    await (isDatabaseConnected()
      ? donationModel.create(donationPayload)
      : createInMemoryDonation(donationPayload));

    const sslcz = new SSLCommerzPayment(
      process.env.SSL_STORE_ID,
      process.env.SSL_STORE_PASSWORD,
      process.env.SSL_IS_LIVE === "true"
    );

    const data = {
      total_amount: parsedAmount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${apiBaseUrl}/donations/success`,
      fail_url: `${apiBaseUrl}/donations/fail`,
      cancel_url: `${apiBaseUrl}/donations/cancel`,
      shipping_method: "NO",
      product_name: donationPayload.campaignTitle,
      product_category: "Donation",
      product_profile: "general",
      cus_name: donorName.trim(),
      cus_email: donorEmail.trim(),
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: donorPhone?.trim() || "01700000000",
      value_a: campaignId?.trim() || "",
      value_b: note?.trim() || "",
      value_c: String(normalizeBoolean(isAnonymous)),
      value_d: "AlokBortika Donation",
    };

    const apiResponse = await sslcz.init(data);

    if (!apiResponse?.GatewayPageURL) {
      return res.status(400).json({
        success: false,
        message: "Unable to generate SSLCommerz payment URL.",
      });
    }

    return res.json({
      success: true,
      message: "Payment session created successfully.",
      gatewayUrl: apiResponse.GatewayPageURL,
      transactionId,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Payment initiation failed.",
    });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const transactionId =
  req.body?.tran_id ||
  req.query?.tran_id ||
  req.body?.transactionId ||
  req.query?.transactionId;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (!transactionId) {
      return res.redirect(`${clientUrl}/donate?payment=failed`);
    }

    let donation;

    if (isDatabaseConnected()) {
      donation = await donationModel.findOneAndUpdate(
        { transactionId },
        {
          status: "Received",
          donatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      donation = updateInMemoryDonationStatus(transactionId, "Received");
    }

    if (!donation) {
      return res.redirect(`${clientUrl}/donate?payment=failed`);
    }

    return res.redirect(
      `${clientUrl}/donate?payment=success&transactionId=${transactionId}`
    );
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return res.redirect(`${clientUrl}/donate?payment=failed`);
  }
};

export const paymentFail = async (req, res) => {
  try {
    const transactionId =
  req.body?.tran_id ||
  req.query?.tran_id ||
  req.body?.transactionId ||
  req.query?.transactionId;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (transactionId) {
      if (isDatabaseConnected()) {
        await donationModel.findOneAndUpdate(
          { transactionId },
          { status: "Failed" },
          { new: true }
        );
      } else {
        updateInMemoryDonationStatus(transactionId, "Failed");
      }
    }

    return res.redirect(`${clientUrl}/donate?payment=failed`);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return res.redirect(`${clientUrl}/donate?payment=failed`);
  }
};

export const paymentCancel = async (req, res) => {
  try {
    const transactionId =
  req.body?.tran_id ||
  req.query?.tran_id ||
  req.body?.transactionId ||
  req.query?.transactionId;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (transactionId) {
      if (isDatabaseConnected()) {
        await donationModel.findOneAndUpdate(
          { transactionId },
          { status: "Cancelled" },
          { new: true }
        );
      } else {
        updateInMemoryDonationStatus(transactionId, "Cancelled");
      }
    }

    return res.redirect(`${clientUrl}/donate?payment=cancelled`);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return res.redirect(`${clientUrl}/donate?payment=cancelled`);
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
          $match: {
            status: "Received",
          },
        },
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
            status: "Received",
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
        .find({ status: "Received" })
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