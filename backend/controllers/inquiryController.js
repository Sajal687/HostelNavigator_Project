const mongoose = require("mongoose");
const { Inquiry } = require("../models/inquiryModel");
const { Hostel } = require("../models/hostelModel");
const { User } = require("../models/userModel");
const { Notification } = require("../models/notificationModel");
const { sendEmailNotification, siteUrl } = require("../services/email");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s-]{6,19}$/;
const STATUSES = ["new", "contacted", "closed"];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));
const cleanString = (value) => (typeof value === "string" ? value.trim() : "");

// POST /api/hostels/:id/inquiries  { student_name, email, phone?, message }
// Public; logged-in students are linked automatically.
const createInquiry = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: "Invalid hostel id" });

  const student_name = cleanString(req.body?.student_name);
  const email = cleanString(req.body?.email).toLowerCase();
  const phone = cleanString(req.body?.phone);
  const message = cleanString(req.body?.message);

  if (student_name.length < 2 || student_name.length > 100) {
    return res.status(400).json({ message: "Please enter your name" });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  if (phone && !PHONE_REGEX.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid phone number" });
  }
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({ message: "Your message should be between 10 and 2000 characters" });
  }

  try {
    const hostel = await Hostel.findOne({ _id: id, status: { $in: ["published", null] } })
      .select("authUser hostel_name owner_email");
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    const student = req.user?.userType === "hostelUser"
      ? await User.findById(req.user.id).select("_id authUser")
      : null;

    const inquiry = await Inquiry.create({
      hostel: hostel._id,
      user: student?._id,
      student_name,
      email,
      phone: phone || undefined,
      message,
    });

    await Notification.create({
      sender: student?.authUser,
      receiver: hostel.authUser,
      message: `New inquiry from ${student_name} about ${hostel.hostel_name}.`,
      markRead: "no",
    });
    sendEmailNotification(
      hostel.owner_email,
      `You have a new inquiry for ${hostel.hostel_name}.\n\nFrom: ${student_name} <${email}>${phone ? `\nPhone: ${phone}` : ""}\n\n${message}\n\nReply to this email to answer the student directly, then mark the inquiry as contacted: ${siteUrl("/ownerdashboard")}\n\n- HostelNavigator`,
      `New inquiry for ${hostel.hostel_name}`,
      { replyTo: `${student_name} <${email}>` }
    );

    res.status(201).json({
      message: "Your inquiry was sent. The owner will contact you soon.",
      data: { _id: inquiry._id },
    });
  } catch (error) {
    console.log(`Creating inquiry failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/owner/inquiries?status=new|contacted|closed
const getOwnerInquiries = async (req, res) => {
  const { status } = req.query;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
  }
  try {
    const filter = { hostel: req.user.id, ...(status ? { status } : {}) };
    const [inquiries, counts] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
      Inquiry.aggregate([
        { $match: { hostel: new mongoose.Types.ObjectId(String(req.user.id)) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    res.status(200).json({
      message: "Inquiries fetched",
      data: inquiries,
      counts: Object.fromEntries(STATUSES.map((s) => [s, counts.find((c) => c._id === s)?.count || 0])),
    });
  } catch (error) {
    console.log(`Fetching inquiries failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /api/owner/inquiries/:inquiryId  { status }
const updateInquiryStatus = async (req, res) => {
  const { inquiryId } = req.params;
  const { status } = req.body || {};
  if (!isObjectId(inquiryId)) return res.status(400).json({ message: "Invalid inquiry id" });
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
  }
  try {
    // Scoped to the owner's hostel so owners can only update their own leads.
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: inquiryId, hostel: req.user.id },
      { $set: { status } },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.status(200).json({ message: "Inquiry updated", data: inquiry });
  } catch (error) {
    console.log(`Updating inquiry failed: ${error.message}`);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { createInquiry, getOwnerInquiries, updateInquiryStatus };
