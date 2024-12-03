import { eq, ilike } from "drizzle-orm"
import type { Task } from "~~/schemas/tasks"
import { db } from "./connection"
import { tasksTable } from "./schema"

type GetTasksOptions = { query?: string }
export async function dbGetTasks(options?: GetTasksOptions): Promise<Task[]> {
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(ilike(tasksTable.title, `%${options?.query || ""}%`))
    .orderBy(tasksTable.id)
  return tasks
}

export async function dbGetTask(id: number): Promise<Task> {
  const taskRes = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
  if (!taskRes[0]) throw new Error()

  return taskRes[0]
}

export async function dbAddTask(title: string): Promise<Task | undefined> {
  const inserted = await db.insert(tasksTable).values({ title }).returning()
  return inserted[0]
}

export async function dbUpdateTask({
  id,
  title,
  done,
  parentTaskId,
}: Task): Promise<Task | undefined> {
  const updated = await db
    .update(tasksTable)
    .set({ title, done, parentTaskId })
    .where(eq(tasksTable.id, id))
    .returning()
  return updated[0]
}

export async function dbDeleteTask(id: number): Promise<Task | undefined> {
  const deleted = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, id))
    .returning()

  return deleted[0]
}
