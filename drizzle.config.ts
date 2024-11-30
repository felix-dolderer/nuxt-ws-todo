import "dotenv/config"
import { defineConfig } from "drizzle-kit"
import { defaultConfig } from "./defaultConfig"

export default defineConfig({
  out: "./server/db/drizzle",
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NUXT_DB_URL || defaultConfig.db.url,
  },
})
