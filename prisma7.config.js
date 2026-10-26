require("dotenv/config");

let defineConfig;
try {
  defineConfig = require("@prisma/prisma7/config").defineConfig;
} catch (e) {
  defineConfig = require("prisma/config").defineConfig;
}

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
