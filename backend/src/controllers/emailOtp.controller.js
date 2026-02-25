const User = require("../models/User");
const { issueOtp, verifyOtp } = require("../services/email/otp.service");

async function requestEmailOtp(req, res) {
  const email = String(req.validated.body.email || "").toLowerCase().trim();
  const purpose = String(req.validated.body.purpose || "verify").trim();
  if (!email) return res.status(400).json({ message: "Email is required" });

  const enabled = process.env.EMAIL_OTP_ENABLED === "true" || process.env.REQUIRE_EMAIL_VERIFICATION === "true";
  if (!enabled) return res.status(400).json({ message: "OTP is disabled" });

  // Avoid account enumeration: always return success.
  const user = await User.findOne({ email }).select("_id emailVerified");
  if (user && !user.emailVerified) {
    await issueOtp({ email, purpose });
  }

  return res.json({ success: true });
}

async function verifyEmailOtp(req, res) {
  const email = String(req.validated.body.email || "").toLowerCase().trim();
  const code = String(req.validated.body.code || "").trim();
  const purpose = String(req.validated.body.purpose || "verify").trim();
  if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

  const enabled = process.env.EMAIL_OTP_ENABLED === "true" || process.env.REQUIRE_EMAIL_VERIFICATION === "true";
  if (!enabled) return res.status(400).json({ message: "OTP is disabled" });

  const ok = await verifyOtp({ email, purpose, code });
  if (!ok.ok) return res.status(400).json({ message: "Invalid or expired code" });

  await User.updateOne({ email }, { $set: { emailVerified: true } });
  return res.json({ success: true });
}

module.exports = { requestEmailOtp, verifyEmailOtp };

