import { z } from "zod"

export const TASK_TOPICS = Object.freeze({
  GET: "tasks",
  ADD: "tasks.add",
  UPDATE: "tasks.update",
  DELETE: "tasks.delete",
})

export const TASK_COMMANDS = Object.freeze({
  GET: "getTasks",
  ADD: "addTask",
  UPDATE: "updateTask",
  DELETE: "deleteTask",
})

const taskSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(255),
  done: z.boolean(),
})
export type Task = z.infer<typeof taskSchema>

const taskIdSchema = taskSchema.pick({ id: true })
export type TaskId = z.infer<typeof taskIdSchema>

const taskTitleSchema = taskSchema.pick({ title: true })
export type TaskTitle = z.infer<typeof taskTitleSchema>

const commandTasksGetSchema = z.object({
  command: z.literal(TASK_COMMANDS.GET),
})

const commandTasksAddSchema = z.object({
  command: z.literal(TASK_COMMANDS.ADD),
  data: taskTitleSchema,
})

const commandTasksUpdateSchema = z.object({
  command: z.literal(TASK_COMMANDS.UPDATE),
  data: taskSchema,
})

const commandTasksDeleteSchema = z.object({
  command: z.literal(TASK_COMMANDS.DELETE),
  data: taskIdSchema,
})

export const taskCommandSchema = z.union([
  commandTasksGetSchema,
  commandTasksAddSchema,
  commandTasksUpdateSchema,
  commandTasksDeleteSchema,
])

const topicTasksGetSchema = z.object({
  topic: z.literal(TASK_TOPICS.GET),
  data: z.array(taskSchema),
})

const topicTasksAddSchema = z.object({
  topic: z.literal(TASK_TOPICS.ADD),
  data: taskSchema,
})

const topicTasksUpdateSchema = z.object({
  topic: z.literal(TASK_TOPICS.UPDATE),
  data: taskSchema,
})

const topicTasksDeleteSchema = z.object({
  topic: z.literal(TASK_TOPICS.DELETE),
  data: taskIdSchema,
})

export const taskTopicSchema = z.union([
  topicTasksGetSchema,
  topicTasksAddSchema,
  topicTasksUpdateSchema,
  topicTasksDeleteSchema,
])
