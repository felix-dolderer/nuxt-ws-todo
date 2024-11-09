import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core"

export const tasksTable = pgTable("tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  done: boolean().notNull().default(false),
})
