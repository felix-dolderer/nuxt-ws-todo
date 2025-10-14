import { and, eq, ilike } from "drizzle-orm"
import type { AddTaskData, Task, TaskWithSubtasks } from "~~/schemas/tasks"
import { db } from "./connection"
import { tasksTable } from "./schema"
import { dbAddAuditLog } from "./auditLogs"

type GetTasksOptions = { query?: string }
export async function dbGetTasks(options?: GetTasksOptions): Promise<Task[]> {
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        ilike(tasksTable.title, `%${options?.query || ""}%`),
        eq(tasksTable.deleted, false),
      ),
    )
    .orderBy(tasksTable.id)
  return tasks
}

export async function dbGetTask(id: number): Promise<Task> {
  const taskRes = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.deleted, false)))
  if (!taskRes[0]) throw new Error()

  return taskRes[0]
}

export async function dbGetTaskWithSubtasks(
  id: number,
): Promise<TaskWithSubtasks> {
  const taskRes = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.deleted, false)))
  if (!taskRes[0]) throw new Error()
  const task = taskRes[0]
  const subtasks = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.parentTaskId, id), eq(tasksTable.deleted, false)))

  return {
    ...task,
    subtasks,
  }
}

export async function dbAddTask(addTaskData: AddTaskData): Promise<Task> {
  return await db.transaction(async (tx) => {
    const inserted = await tx.insert(tasksTable).values(addTaskData).returning()
    if (!inserted[0]) throw new Error()
    await dbAddAuditLog(tx, {
      resourceType: "task",
      resourceId: inserted[0].id,
      action: "create",
      data: inserted[0],
    })
    return inserted[0]
  })
}

export async function dbUpdateTask({
  id,
  title,
  done,
  parentTaskId,
}: Task): Promise<Task> {
  return await db.transaction(async (tx) => {
    const updated = await tx
      .update(tasksTable)
      .set({ title, done, parentTaskId })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.deleted, false)))
      .returning()
    if (!updated[0]) throw new Error()
    await dbAddAuditLog(tx, {
      resourceType: "task",
      resourceId: id,
      action: "update",
      data: updated[0],
    })
    return updated[0]
  })
}

export async function dbDeleteTask(id: number): Promise<Task> {
  return await db.transaction(async (tx) => {
    const deleted = await tx
      .update(tasksTable)
      .set({ deleted: true })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.deleted, false)))
      .returning()
    if (!deleted[0]) throw new Error()
    await dbAddAuditLog(tx, {
      resourceType: "task",
      resourceId: id,
      action: "delete",
      data: deleted[0],
    })
    return deleted[0]
  })
}
