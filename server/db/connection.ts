import { drizzle } from "drizzle-orm/node-postgres"
import { auditLogsTable, tasksTable } from "./schema"

export const db = drizzle(useRuntimeConfig().db.url, {
  schema: { auditLogsTable, tasksTable },
})
