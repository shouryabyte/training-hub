const User = require("../models/User");
const AiUsage = require("../models/AiUsage");

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function aiQuota(feature) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "No token" });

      const user = await User.findById(userId).select("role");
      if (!user) return res.status(401).json({ message: "Invalid token" });

      // Platform roles: unlimited (content + operations)
      if (user.role === "ADMIN" || user.role === "TEACHER") return next();

      const limit = Number(process.env.AI_DAILY_LIMIT || 20);
      const day = utcDay();

      const updated = await AiUsage.findOneAndUpdate(
        { userId, day, feature },
        { $inc: { count: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (updated.count > limit) {
        return res.status(429).json({
          message: "AI quota exceeded",
          dailyLimit: limit,
          feature,
        });
      }

      req.aiQuota = { day, feature, count: updated.count, dailyLimit: limit };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { aiQuota };
