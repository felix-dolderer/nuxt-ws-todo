import { drizzle } from "drizzle-orm/node-postgres"
import { tasksTable } from "./schema"

export const db = drizzle(useRuntimeConfig().db.url, { schema: { tasksTable } })
