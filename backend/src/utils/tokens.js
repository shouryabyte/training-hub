const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateAccessToken({ id, role }) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseDurationToMs(input, fallbackMs) {
  if (!input) return fallbackMs;
  const match = String(input).trim().match(/^(\d+)\s*(ms|s|m|h|d)$/i);
  if (!match) return fallbackMs;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult =
    unit === "ms"
      ? 1
      : unit === "s"
      ? 1000
      : unit === "m"
      ? 60 * 1000
      : unit === "h"
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
  return n * mult;
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  parseDurationToMs,
};

