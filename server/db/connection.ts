import { drizzle } from "drizzle-orm/node-postgres"
import { tasksTable } from "./schema"

export const db = drizzle(process.env.DATABASE_URL!, { schema: { tasksTable } })
