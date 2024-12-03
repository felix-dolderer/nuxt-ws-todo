import { tasksCommandSchema } from "~~/schemas/tasks"

export const _buildTasksCommand = tasksCommandSchema.safeParse
