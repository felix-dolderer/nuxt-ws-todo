import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core"

export const tasksTable = pgTable(
  "tasks",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    done: boolean().notNull().default(false),
    parentTaskId: integer(),
    deleted: boolean().notNull().default(false),
  },
  (t) => [
    foreignKey({
      columns: [t.parentTaskId],
      foreignColumns: [t.id],
    }),
    index("deleted_index").on(t.deleted),
  ],
)
