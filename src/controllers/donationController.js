const Donation = require("../models/Donation");

// Submit New Donation Request
const createDonation = async (req, res) => {
  try {
    const { name, phone, amount, method, campaignSlug, senderNumber, address, trxId } = req.body;

    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ message: "Invalid donation amount specified" });
    }

    if (method !== "bank") {
      if (!senderNumber || !trxId) {
        return res.status(400).json({ message: "Sender number and Transaction ID are required for mobile banking" });
      }

      // Check for duplicate transaction id
      const duplicateTrx = await Donation.findOne({ trxId: trxId.trim() });
      if (duplicateTrx) {
        return res.status(400).json({ message: "This Transaction ID has already been verified or submitted" });
      }
    }

    const donation = await Donation.create({
      name,
      phone,
      amount: Number(amount),
      method,
      campaignSlug,
      senderNumber: method !== "bank" ? senderNumber : undefined,
      trxId: method !== "bank" ? trxId.trim() : undefined,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Donation record recorded successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Donation (Admin)
const getDonationLogs = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    const logs = await Donation.find(query)
      .populate("actionBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Donation (Admin)
const approveDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation entry not found" });
    if (donation.status !== "pending") return res.status(400).json({ message: "This entry is already resolved" });

    donation.status = "approved";
    donation.actionBy = req.user._id;
    donation.resolvedAt = new Date();
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation entry verified and approved successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject Donation (Admin)
const rejectDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation entry not found" });
    if (donation.status !== "pending") return res.status(400).json({ message: "This entry is already resolved" });

    donation.status = "rejected";
    donation.actionBy = req.user._id;
    donation.resolvedAt = new Date();
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation tracking entry marked as rejected",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonation,
  getDonationLogs,
  approveDonation,
  rejectDonation,
};