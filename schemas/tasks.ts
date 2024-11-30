import { z } from "zod"

export const TASKS_TOPICS = Object.freeze({
  GET: "tasks",
  ADD: "tasks.add",
  UPDATE: "tasks.update",
  DELETE: "tasks.delete",
})

export const TASKS_COMMANDS = Object.freeze({
  GET: "getTasks",
  ADD: "addTask",
  UPDATE: "updateTask",
  DELETE: "deleteTask",
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

const commandTasksAddSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ADD),
  data: taskTitleSchema,
})

const commandTasksUpdateSchema = z.object({
  command: z.literal(TASKS_COMMANDS.UPDATE),
  data: taskSchema,
})

const commandTasksDeleteSchema = z.object({
  command: z.literal(TASKS_COMMANDS.DELETE),
  data: taskIdSchema,
})

export const tasksCommandSchema = z.union([
  commandTasksGetSchema,
  commandTasksAddSchema,
  commandTasksUpdateSchema,
  commandTasksDeleteSchema,
])

const topicTasksGetSchema = z.object({
  topic: z.literal(TASKS_TOPICS.GET),
  data: z.array(taskSchema),
})

const topicTasksAddSchema = z.object({
  topic: z.literal(TASKS_TOPICS.ADD),
  data: taskSchema,
})

const topicTasksUpdateSchema = z.object({
  topic: z.literal(TASKS_TOPICS.UPDATE),
  data: taskSchema,
})

const topicTasksDeleteSchema = z.object({
  topic: z.literal(TASKS_TOPICS.DELETE),
  data: taskIdSchema,
})

export const tasksTopicSchema = z.union([
  topicTasksGetSchema,
  topicTasksAddSchema,
  topicTasksUpdateSchema,
  topicTasksDeleteSchema,
])
