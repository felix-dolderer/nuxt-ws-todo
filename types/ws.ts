import { z } from "zod"

export const TOPICS = Object.freeze({
  TASKS: Object.freeze({
    GET: 'tasks',
    ADD: 'tasks.add',
    UPDATE: 'tasks.update',
    DELETE: 'tasks.delete',
  })
})

export const COMMANDS = Object.freeze({
  TASKS: Object.freeze({
    GET: 'getTasks',
    ADD: 'addTask',
    UPDATE: 'updateTask',
    DELETE: 'deleteTask',
  })
})

const taskSchema = z.object({
  id: z.number(),
  title: z.string().min(2),
  done: z.boolean(),
})
export type Task = z.infer<typeof taskSchema>

const taskIdSchema = taskSchema.pick({ id: true })
export type TaskId = z.infer<typeof taskIdSchema>

const commandTasksGetSchema = z.object({
  command: z.literal(COMMANDS.TASKS.GET),
})

const commandTasksAddSchema = z.object({
  command: z.literal(COMMANDS.TASKS.ADD),
  data: taskSchema,
})

const commandTasksUpdateSchema = z.object({
  command: z.literal(COMMANDS.TASKS.UPDATE),
  data: taskSchema,
})

const commandTasksDeleteSchema = z.object({
  command: z.literal(COMMANDS.TASKS.DELETE),
  data: taskIdSchema,
})

export const taskCommandSchema = z.union([
  commandTasksGetSchema,
  commandTasksAddSchema,
  commandTasksUpdateSchema,
  commandTasksDeleteSchema,
])

const topicTasksGetSchema = z.object({
  topic: z.literal(TOPICS.TASKS.GET),
  data: z.array(taskSchema),
})

const topicTasksAddSchema = z.object({
  topic: z.literal(TOPICS.TASKS.ADD),
  data: taskSchema,
})

const topicTasksUpdateSchema = z.object({
  topic: z.literal(TOPICS.TASKS.UPDATE),
  data: taskSchema,
})

const topicTasksDeleteSchema = z.object({
  topic: z.literal(TOPICS.TASKS.DELETE),
  data: taskIdSchema,
})

export const taskTopicSchema = z.union([
  topicTasksGetSchema,
  topicTasksAddSchema,
  topicTasksUpdateSchema,
  topicTasksDeleteSchema,
])
