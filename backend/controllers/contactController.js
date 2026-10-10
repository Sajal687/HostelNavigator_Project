const { sendEmail, isEmailConfigured, oneLine } = require("../services/email");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = ["general", "student", "owner", "listing-issue", "technical"];
const TOPIC_LABELS = {
  general: "General question",
  student: "Student support",
  owner: "Hostel owner support",
  "listing-issue": "Report a listing",
  technical: "Technical problem",
};

const supportInbox = () => process.env.CONTACT_EMAIL || "support@hostelnavigator.online";
const clean = (value) => (typeof value === "string" ? value.trim() : "");

// GET /api/contact/status - lets the page fall back to a mailto link when email is off.
const contactStatus = (req, res) => {
  res.status(200).json({ message: "Contact status", data: { enabled: isEmailConfigured(), email: supportInbox() } });
};

// POST /api/contact  { name, email, topic?, message, website? }
const sendContactMessage = async (req, res) => {
  const body = req.body || {};

  // Honeypot: the "website" field is hidden from people, so only bots fill it.
  // Pretend success so bots don't learn to avoid it.
  if (clean(body.website)) {
    return res.status(200).json({ message: "Thanks! We'll get back to you soon." });
  }

  const name = oneLine(clean(body.name));
  const email = clean(body.email).toLowerCase();
  const topic = TOPICS.includes(body.topic) ? body.topic : "general";
  const message = clean(body.message);

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: "Please enter your name" });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 200) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  if (message.length < 10 || message.length > 3000) {
    return res.status(400).json({ message: "Your message should be between 10 and 3000 characters" });
  }
  if (!isEmailConfigured()) {
    return res.status(503).json({ message: `The contact form is unavailable right now. Please email us at ${supportInbox()}.` });
  }

  try {
    await sendEmail({
      to: supportInbox(),
      replyTo: `${name} <${email}>`,
      subject: `[Contact] ${TOPIC_LABELS[topic]} - ${name}`,
      text: [
        `New message from the HostelNavigator contact form.`,
        ``,
        `Name:  ${name}`,
        `Email: ${email}`,
        `Topic: ${TOPIC_LABELS[topic]}`,
        ``,
        message,
        ``,
        `Reply to this email to respond directly to ${name}.`,
      ].join("\n"),
    });
    res.status(200).json({ message: "Thanks! Your message was sent. We usually reply within one working day." });
  } catch (error) {
    console.log(`Contact email failed: ${error.message}`);
    res.status(502).json({ message: `We couldn't send your message. Please try again or email us at ${supportInbox()}.` });
  }
};

module.exports = { contactStatus, sendContactMessage, TOPICS };
