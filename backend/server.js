const http = require("http");

const { loadEnv } = require("./src/config/env");
loadEnv();

const app = require("./src/app");
const { connectDb } = require("./src/config/db");
const { seedCoreCatalog } = require("./src/config/seed");

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDb();
  await seedCoreCatalog();

  const server = http.createServer(app);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});
