import type { z } from "zod"
import { tasksCommandSchema } from "~~/schemas/tasks"

export function _buildTasksCommand(
  taskCommand: z.infer<typeof tasksCommandSchema>,
) {
  return tasksCommandSchema.safeParse(taskCommand)
}
