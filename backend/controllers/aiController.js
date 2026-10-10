const crypto = require("crypto");
const mongoose = require("mongoose");
const { Hostel } = require("../models/hostelModel");
const { Review } = require("../models/reviewModel");
const aiService = require("../services/aiService");

const MAX_QUERY_LENGTH = 500;
const MAX_CHAT_TURNS = 10;
const MAX_CHAT_MESSAGE_LENGTH = 1000;
const CATALOG_LIMIT = 40;

const sendError = (res, error) => {
  if (error instanceof aiService.AIServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
};

const isObjectId = (value) => typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

// Only listing content (no owner contact details or internal ids) is sent to the model.
const toListingContext = (hostel, reviews = []) => ({
  name: hostel.hostel_name,
  city: hostel.hostel_address?.city,
  address: [hostel.hostel_address?.street, hostel.hostel_address?.city, hostel.hostel_address?.state]
    .filter(Boolean)
    .join(", "),
  for: hostel.hostel_gender_type === "Both" ? "Co-ed" : hostel.hostel_gender_type,
  monthlyRentInr: hostel.hostel_rent,
  roomTypes: hostel.hostel_rooms?.room_capacity || [],
  facilities: hostel.hostel_facilities || [],
  description: hostel.description || null,
  houseRules: hostel.house_rules || null,
  reviews: reviews.map((review) => ({
    rating: review.rating,
    comment: review.comment.slice(0, 500),
  })),
});

// POST /api/ai/search-query  { query }
const searchQuery = async (req, res) => {
  const { query } = req.body || {};
  if (typeof query !== "string" || query.trim().length < 3) {
    return res.status(400).json({ message: "Describe what you're looking for in a few words" });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ message: `Search text must be under ${MAX_QUERY_LENGTH} characters` });
  }
  try {
    const filters = await aiService.parseSearchQuery(query.trim());
    res.status(200).json({ message: "Search understood", data: { filters } });
  } catch (error) {
    sendError(res, error);
  }
};

// POST /api/ai/summarize-listing  { hostelId }
const summarizeListing = async (req, res) => {
  const { hostelId } = req.body || {};
  if (!isObjectId(hostelId)) {
    return res.status(400).json({ message: "A valid hostelId is required" });
  }
  try {
    const hostel = await Hostel.findById(hostelId).select("-hostel_img -all_users").lean();
    if (!hostel || hostel.status === "draft" || hostel.status === "archived") {
      return res.status(404).json({ message: "Hostel not found" });
    }
    const reviews = await Review.find({ hostel: hostel._id, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("rating comment")
      .lean();

    const listing = toListingContext(hostel, reviews);
    const sourceHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ listing, model: aiService.AI_MODEL, v: aiService.SUMMARY_PROMPT_VERSION }))
      .digest("hex");

    // Serve the cached summary unless the listing (or prompt/model) changed since it was built.
    if (hostel.ai_summary?.sourceHash === sourceHash && hostel.ai_summary.data) {
      return res.status(200).json({
        message: "Summary loaded",
        data: { summary: hostel.ai_summary.data, generatedAt: hostel.ai_summary.generatedAt, cached: true },
      });
    }

    const summary = await aiService.summarizeListing(listing);
    const generatedAt = new Date();
    await Hostel.updateOne(
      { _id: hostel._id },
      { $set: { ai_summary: { data: summary, sourceHash, model: aiService.AI_MODEL, generatedAt } } }
    );
    res.status(200).json({ message: "Summary generated", data: { summary, generatedAt, cached: false } });
  } catch (error) {
    sendError(res, error);
  }
};

const buildCatalog = async () => {
  const hostels = await Hostel.find({ status: { $in: ["published", null] } })
    .select("hostel_name hostel_address hostel_rent hostel_gender_type hostel_rooms hostel_facilities")
    .sort({ hostel_rating: -1, _id: 1 })
    .limit(CATALOG_LIMIT)
    .lean();
  return hostels
    .map((h) =>
      [
        h.hostel_name,
        [h.hostel_address?.street, h.hostel_address?.city].filter(Boolean).join(", "),
        `Rs ${h.hostel_rent}/month`,
        h.hostel_gender_type === "Both" ? "Co-ed" : h.hostel_gender_type,
        `rooms: ${(h.hostel_rooms?.room_capacity || []).join("/") || "n/a"}`,
        `facilities: ${(h.hostel_facilities || []).join(", ") || "n/a"}`,
      ].join(" | ")
    )
    .join("\n");
};

// POST /api/ai/concierge  { messages: [{ role, content }], hostelId? }
const concierge = async (req, res) => {
  const { messages, hostelId } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages must be a non-empty array" });
  }
  const recent = messages.slice(-MAX_CHAT_TURNS);
  const valid = recent.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      m.content.length <= MAX_CHAT_MESSAGE_LENGTH
  );
  if (!valid) {
    return res.status(400).json({
      message: `Each message needs a role of "user" or "assistant" and text under ${MAX_CHAT_MESSAGE_LENGTH} characters`,
    });
  }
  // The conversation sent to Claude must start and end with the student's turn.
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") {
    return res.status(400).json({ message: "The last message must be from the user" });
  }
  if (hostelId !== undefined && hostelId !== null && !isObjectId(hostelId)) {
    return res.status(400).json({ message: "hostelId is invalid" });
  }

  try {
    const [catalog, current] = await Promise.all([
      buildCatalog(),
      hostelId ? Hostel.findById(hostelId).select("-hostel_img -all_users").lean() : null,
    ]);
    const reply = await aiService.conciergeReply({
      messages: recent.map((m) => ({ role: m.role, content: m.content.trim() })),
      catalog,
      currentListing: current ? toListingContext(current) : null,
    });
    res.status(200).json({ message: "Reply generated", data: { reply } });
  } catch (error) {
    sendError(res, error);
  }
};

// GET /api/ai/status - lets the frontend hide AI features when they're switched off.
const status = (req, res) => {
  res.status(200).json({ message: "AI status", data: { enabled: aiService.isConfigured() } });
};

module.exports = { searchQuery, summarizeListing, concierge, status };
