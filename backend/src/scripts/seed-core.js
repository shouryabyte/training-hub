/* eslint-disable no-console */
const mongoose = require("mongoose");

const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");
const { seedCoreCatalog } = require("../config/seed");

async function main() {
  loadEnv();
  await connectDb();
  await seedCoreCatalog();
  await mongoose.disconnect();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("seed-core failed:", err);
  process.exit(1);
});

