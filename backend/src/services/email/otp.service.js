const crypto = require("crypto");

const EmailOtp = require("../../models/EmailOtp");
const { sendEmail } = require("./email.service");

function randomCode() {
  // 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashCode(code) {
  const secret = String(process.env.OTP_SECRET || process.env.JWT_SECRET || "otp").trim();
  return crypto.createHmac("sha256", secret).update(String(code)).digest("hex");
}

function ttlMs() {
  const t = Number(process.env.OTP_TTL_MS || 10 * 60 * 1000);
  return Number.isFinite(t) && t > 30_000 ? t : 10 * 60 * 1000;
}

async function issueOtp({ email, purpose }) {
  const code = randomCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + ttlMs());

  await EmailOtp.create({ email, purpose, codeHash, expiresAt });

  const subject = "Your Nexchakra verification code";
  const text = `Your verification code is: ${code}\n\nThis code expires in ${Math.round(ttlMs() / 60000)} minutes.\nIf you didn't request this, ignore this message.`;
  await sendEmail({ to: email, subject, text });

  return { expiresAt };
}

async function verifyOtp({ email, purpose, code }) {
  const codeHash = hashCode(code);
  const otp = await EmailOtp.findOne({
    email,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
    codeHash,
  }).sort({ createdAt: -1 });
  if (!otp) return { ok: false };

  otp.consumedAt = new Date();
  await otp.save();
  return { ok: true };
}

module.exports = { issueOtp, verifyOtp };

