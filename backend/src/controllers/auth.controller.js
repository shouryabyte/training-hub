const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  parseDurationToMs,
} = require("../utils/tokens");

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

function clearRefreshCookie(req, res) {
  const secure = cookieSecureFlag(req);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/api/auth",
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

async function register(req, res) {
  try {
    const { name, email, password } = req.validated.body;
    const adminInviteKey = String(req.validated.body.adminInviteKey || "").trim();
    const teacherInviteKey = String(req.validated.body.teacherInviteKey || "").trim();

    if (adminInviteKey && teacherInviteKey) {
      return res.status(400).json({ message: "Provide only one invite key" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    let role = "STUDENT";
    if (adminInviteKey) {
      if (adminInviteKey !== String(process.env.ADMIN_INVITE_KEY || "").trim()) {
        return res.status(403).json({ message: "Invalid admin invite key" });
      }
      role = "ADMIN";
    }
    if (teacherInviteKey) {
      if (teacherInviteKey !== String(process.env.TEACHER_INVITE_KEY || "").trim()) {
        return res.status(403).json({ message: "Invalid teacher invite key" });
      }
      role = "TEACHER";
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = await issueTokensForUser({ user, req, res });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.validated.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = await issueTokensForUser({ user, req, res });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}

async function logout(req, res) {
  try {
    const raw = req.cookies.refreshToken || req.body.refreshToken || "";
    if (raw) {
      const tokenHash = hashToken(String(raw));
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }
  } catch (_err) {
    // best-effort
  }

  clearRefreshCookie(req, res);
  return res.json({ message: "Logout successful (client-side token removal)" });
}

async function refresh(req, res) {
  const raw = req.cookies.refreshToken || req.body.refreshToken;
  if (!raw) return res.status(401).json({ message: "No refresh token" });

  const tokenHash = hashToken(String(raw));
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored || stored.revokedAt) return res.status(401).json({ message: "Invalid refresh token" });
  if (stored.expiresAt.getTime() < Date.now()) return res.status(401).json({ message: "Refresh token expired" });

  const user = await User.findById(stored.user);
  if (!user) return res.status(401).json({ message: "Invalid refresh token" });

  const newRefreshValue = generateRefreshTokenValue();
  const newRefreshHash = hashToken(newRefreshValue);
  const refreshTtlMs = parseDurationToMs(
    process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    30 * 24 * 60 * 60 * 1000
  );
  const expiresAt = new Date(Date.now() + refreshTtlMs);

  stored.revokedAt = new Date();
  stored.replacedByTokenHash = newRefreshHash;
  await stored.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: newRefreshHash,
    expiresAt,
    userAgent: String(req.headers["user-agent"] || ""),
    ip: String(req.ip || ""),
  });

  setRefreshCookie(req, res, newRefreshValue);
  const token = generateAccessToken({ id: String(user._id), role: user.role });
  return res.json({ token });
}

module.exports = { register, login, logout, refresh };
