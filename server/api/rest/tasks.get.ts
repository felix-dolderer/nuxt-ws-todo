import { z } from "zod"
import { dbGetTasks } from "~~/server/db/tasks"

export default defineEventHandler(async (event) => {
  const rawQuery = getQuery(event)
  const parsedQuery = z
    .object({ query: z.string() })
    .optional()
    .safeParse(rawQuery)

  return parsedQuery.success
    ? await dbGetTasks(parsedQuery.data)
    : await dbGetTasks()
})
