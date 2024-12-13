import { eq, ilike } from "drizzle-orm"
import type { AddTaskData, Task, TaskWithSubtasks } from "~~/schemas/tasks"
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

export async function dbGetTaskWithSubtasks(
  id: number,
): Promise<TaskWithSubtasks> {
  const taskRes = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
  if (!taskRes[0]) throw new Error()
  const task = taskRes[0]
  const subtasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.parentTaskId, id))

  return {
    ...task,
    subtasks,
  }
}

export async function dbAddTask(addTaskData: AddTaskData): Promise<Task> {
  const inserted = await db.insert(tasksTable).values(addTaskData).returning()
  if (!inserted[0]) throw new Error()
  return inserted[0]
}

export async function dbUpdateTask({
  id,
  title,
  done,
  parentTaskId,
}: Task): Promise<Task> {
  const updated = await db
    .update(tasksTable)
    .set({ title, done, parentTaskId })
    .where(eq(tasksTable.id, id))
    .returning()
  if (!updated[0]) throw new Error()
  return updated[0]
}

export async function dbDeleteTask(id: number): Promise<Task> {
  const deleted = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, id))
    .returning()
  if (!deleted[0]) throw new Error()
  return deleted[0]
}
