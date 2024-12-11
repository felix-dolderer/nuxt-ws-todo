import { tasksCommandSchema } from "~~/schemas/tasks"

export const _buildTasksCommand = tasksCommandSchema.safeParse

export const statusFilterOptions = ["Open", "Done", "All"] as const
export type StatusFilter = (typeof statusFilterOptions)[number]
