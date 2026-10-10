const nodemailer = require("nodemailer");

// Email is optional: without SMTP settings, flows still work and only in-app
// notifications are created.
//
// Configure either:
//   - any SMTP provider: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
//   - or Gmail (legacy shortcut): EMAIL_USER + EMAIL_PASS (an app password)
// EMAIL_FROM sets the sender, e.g. "HostelNavigator <no-reply@hostelnavigator.online>".
const createTransport = () => {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // Port 465 uses implicit TLS; 587/25 upgrade with STARTTLS.
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return null;
};

const transporter = createTransport();

const fromAddress = () =>
  process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "HostelNavigator <no-reply@hostelnavigator.online>";

const isEmailConfigured = () => Boolean(transporter);

// Links in emails point at the public site.
const siteUrl = (path = "") => {
  const base = (process.env.CLIENT_URL || "https://hostelnavigator.online").split(",")[0].trim().replace(/\/+$/, "");
  return `${base}${path}`;
};

// Header values must be single-line to prevent header injection.
const oneLine = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim();

// Sends one email and resolves with nodemailer's info; rejects on failure.
// Use when the caller needs to know whether the email went out (e.g. the contact form).
const sendEmail = async ({ to, subject, text, replyTo }) => {
  if (!transporter) {
    const error = new Error("Email is not configured");
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }
  return transporter.sendMail({
    from: fromAddress(),
    to,
    subject: oneLine(subject),
    text,
    replyTo: replyTo ? oneLine(replyTo) : undefined,
  });
};

// Fire-and-forget: notification email failures are logged and never fail the request.
const sendEmailNotification = (email, message, subject = "New Booking Request", { replyTo } = {}) => {
  if (!transporter || !email) {
    console.log("Email not configured or recipient missing; skipping email notification");
    return;
  }
  sendEmail({ to: email, subject, text: message, replyTo })
    .then((info) => console.log(`Email sent: ${oneLine(subject)} (${info.messageId})`))
    .catch((error) => console.log(`Error sending email "${oneLine(subject)}": ${error.message}`));
};

// Confirms SMTP credentials at startup so misconfiguration shows up in the Render logs.
const verifyEmailTransport = async () => {
  if (!transporter) {
    console.log("Email: not configured (set SMTP_* or EMAIL_USER/EMAIL_PASS to enable)");
    return;
  }
  try {
    await transporter.verify();
    console.log("Email: SMTP connection verified");
  } catch (error) {
    console.log(`Email: SMTP verification failed - ${error.message}`);
  }
};

module.exports = { sendEmail, sendEmailNotification, isEmailConfigured, verifyEmailTransport, siteUrl, oneLine };
