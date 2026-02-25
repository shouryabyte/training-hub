const crypto = require("crypto");

const AiResponseCache = require("../models/AiResponseCache");

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sha256(text) {
  return crypto.createHash("sha256").update(String(text || ""), "utf8").digest("hex");
}

function cacheKey({ feature, version, parts }) {
  const normalizedParts = (parts || []).map((p) => normalizeText(p));
  const raw = JSON.stringify({ feature, version, parts: normalizedParts });
  return sha256(raw);
}

async function getCachedResponse({ key }) {
  const hit = await AiResponseCache.findOne({ key, expiresAt: { $gt: new Date() } })
    .select("response provider model")
    .lean();
  return hit || null;
}

async function setCachedResponse({ key, feature, provider, model, response, ttlMs }) {
  const ttl = Number(ttlMs);
  const expiresAt = new Date(Date.now() + (Number.isFinite(ttl) && ttl > 0 ? ttl : 30 * 24 * 60 * 60 * 1000));

  await AiResponseCache.findOneAndUpdate(
    { key },
    {
      $set: {
        feature: String(feature || ""),
        provider: String(provider || ""),
        model: String(model || ""),
        response,
        expiresAt,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

module.exports = { normalizeText, cacheKey, getCachedResponse, setCachedResponse };

