const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const { generateAccessToken, generateRefreshTokenValue, hashToken, parseDurationToMs } = require("../utils/tokens");
const RefreshToken = require("../models/RefreshToken");

function isSecureRequest(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  return Boolean(req.secure) || proto === "https";
}

function cookieSecureFlag(req) {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return isSecureRequest(req);
}

function setRefreshCookie(req, res, tokenValue) {
  const secure = cookieSecureFlag(req);
  res.cookie("refreshToken", tokenValue, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/api/auth",
    maxAge: parseDurationToMs(process.env.REFRESH_TOKEN_EXPIRES_IN, 30 * 24 * 60 * 60 * 1000),
  });
}

async function issueTokensForUser({ user, req, res }) {
  const accessToken = generateAccessToken({ id: String(user._id), role: user.role });

  const refreshValue = generateRefreshTokenValue();
  const refreshHash = hashToken(refreshValue);
  const refreshTtlMs = parseDurationToMs(
    process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    30 * 24 * 60 * 60 * 1000
  );
  const expiresAt = new Date(Date.now() + refreshTtlMs);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshHash,
    expiresAt,
    userAgent: String(req.headers["user-agent"] || ""),
    ip: String(req.ip || ""),
  });

  setRefreshCookie(req, res, refreshValue);
  return accessToken;
}

async function fetchGoogleTokenInfo(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error_description || data?.error || "Google token verification failed");
    err.statusCode = 401;
    throw err;
  }
  return data;
}

async function googleAuth(req, res) {
  const credential = String(req.validated?.body?.credential || "").trim();
  if (!credential) return res.status(400).json({ message: "Missing credential" });

  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  if (!clientId) return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });

  const info = await fetchGoogleTokenInfo(credential);
  if (String(info.aud || "") !== clientId) return res.status(401).json({ message: "Invalid Google token (audience)" });

  const email = String(info.email || "").toLowerCase().trim();
  const name = String(info.name || "").trim() || String(info.given_name || "").trim() || "Student";
  const emailVerified = String(info.email_verified || "") === "true";
  if (!email) return res.status(401).json({ message: "Google token missing email" });
  if (!emailVerified) return res.status(401).json({ message: "Google email not verified" });

  let user = await User.findOne({ email });
  if (!user) {
    // Create a STUDENT account by default for Google sign-in.
    // Admin/Teacher accounts remain invite-gated through the normal signup flow.
    const randomPwd = await hashPassword(`google_${Date.now()}_${Math.random().toString(16).slice(2)}_${email}`);
    user = await User.create({ name, email, password: randomPwd, role: "STUDENT", emailVerified: true, authProvider: "google" });
  } else {
    // If user exists, mark verified/provider info for future checks.
    if (!user.emailVerified) user.emailVerified = true;
    if (!user.authProvider) user.authProvider = "local";
    await user.save();
  }

  const token = await issueTokensForUser({ user, req, res });
  return res.json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

module.exports = { googleAuth };

