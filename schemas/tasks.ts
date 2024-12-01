import { z } from "zod"

const TASK_ID_TOPICS = Object.freeze({
  CHANNEL: (taskId: number) => `tasks.${taskId}`,
  GET: "tasks.getById",
  UPDATE: "tasks.update",
  DELETE: "tasks.delete",
})

export const TASKS_TOPICS = Object.freeze({
  CHANNEL: "tasks",
  GET: "tasks.get",
  ADD: "tasks.add",
  ID: TASK_ID_TOPICS,
})

const TASK_ID_COMMANDS = Object.freeze({
  GET: "getTask",
  UPDATE: "updateTask",
  DELETE: "deleteTask",
})

export const TASKS_COMMANDS = Object.freeze({
  GET: "getTasks",
  ADD: "addTask",
  ID: TASK_ID_COMMANDS,
})

const taskSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(255),
  done: z.boolean(),
  parentTaskId: z.number().nullable(),
})
export type Task = z.infer<typeof taskSchema>

const taskIdSchema = taskSchema.pick({ id: true })
export type TaskId = z.infer<typeof taskIdSchema>

const taskTitleSchema = taskSchema.pick({ title: true })
export type TaskTitle = z.infer<typeof taskTitleSchema>

const commandTasksGetSchema = z.object({
  command: z.literal(TASKS_COMMANDS.GET),
})

const commandTasksGetIdSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ID.GET)
})

const commandTasksAddSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ADD),
  data: taskTitleSchema,
})

const commandTasksUpdateSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ID.UPDATE),
  data: taskSchema,
})

const commandTasksDeleteSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ID.DELETE),
  data: taskIdSchema,
})

export const tasksCommandSchema = z.union([
  commandTasksGetSchema,
  commandTasksGetIdSchema,
  commandTasksAddSchema,
  commandTasksUpdateSchema,
  commandTasksDeleteSchema,
])

const topicTasksGetSchema = z.object({
  topic: z.literal(TASKS_TOPICS.GET),
  data: z.array(taskSchema),
})

const topicTasksGetIdSchema = z.object({
  topic: z.literal(TASKS_TOPICS.ID.GET),
  data: taskSchema,
})

const topicTasksAddSchema = z.object({
  topic: z.literal(TASKS_TOPICS.ADD),
  data: taskSchema,
})

const topicTasksUpdateSchema = z.object({
  topic: z.literal(TASKS_TOPICS.ID.UPDATE),
  data: taskSchema,
})

const topicTasksDeleteSchema = z.object({
  topic: z.literal(TASKS_TOPICS.ID.DELETE),
  data: taskIdSchema,
})

export const tasksTopicSchema = z.union([
  topicTasksGetSchema,
  topicTasksGetIdSchema,
  topicTasksAddSchema,
  topicTasksUpdateSchema,
  topicTasksDeleteSchema,
])
