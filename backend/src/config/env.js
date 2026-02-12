const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  const envPath = process.env.ENV_FILE
    ? path.resolve(process.cwd(), process.env.ENV_FILE)
    : path.resolve(process.cwd(), ".env");
  dotenv.config({ path: envPath });

  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Missing required env vars: ${missing.join(
        ", "
      )}. Server will still start, but requests may fail.`
    );
  }
}

module.exports = { loadEnv };

