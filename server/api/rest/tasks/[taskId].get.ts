import { z } from "zod"
import { dbGetTaskWithSubtasks } from "~~/server/db/tasks"

export default defineEventHandler(async (event) => {
  const rawTaskId = getRouterParam(event, "taskId")
  const parsedTaskId = z.coerce.number().positive().safeParse(rawTaskId)

  if (!parsedTaskId.success) {
    throw createError({ statusCode: 400 })
  }

  return await dbGetTaskWithSubtasks(parsedTaskId.data)
})
