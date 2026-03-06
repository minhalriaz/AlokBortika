import donationModel from "./donation.model.js";

const allowedPaymentMethods = ["bKash", "Nagad", "Bank Transfer", "Cash"];

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export const createDonation = async (req, res) => {
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    paymentMethod,
    transactionId,
    note,
    isAnonymous,
  } = req.body;

  if (!donorName || !donorEmail || !amount || !paymentMethod) {
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

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return res.json({ success: false, message: "Invalid payment method" });
  }

  try {
    const donation = await donationModel.create({
      donorName,
      donorEmail,
      donorPhone,
      amount: parsedAmount,
      paymentMethod,
      transactionId,
      note,
      isAnonymous: Boolean(isAnonymous),
      status: transactionId ? "Received" : "Pending Verification",
    });

    return res.json({
      success: true,
      message: "Thank you. Your donation has been recorded.",
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        donatedAt: donation.donatedAt,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getDonationStats = async (_req, res) => {
  try {
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
        .select("donorName amount currency isAnonymous donatedAt"),
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
        })),
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
