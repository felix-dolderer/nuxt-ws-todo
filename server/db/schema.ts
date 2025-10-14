import {
  boolean,
  foreignKey,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
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

export const actionEnum = pgEnum("action", ["create", "update", "delete"])
export const resourceTypeEnum = pgEnum("resource_type", ["task"])

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
    resourceType: resourceTypeEnum().notNull(),
    resourceId: integer().notNull(),
    action: actionEnum().notNull(),
    data: json().notNull(),
  },
  (t) => [
    index("resource_type_index").on(t.resourceType),
    index("resource_id_index").on(t.resourceId),
    index("action_index").on(t.action),
  ],
)
