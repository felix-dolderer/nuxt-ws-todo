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

export const taskSchema = z.object({
  id: z.number(),
  title: z.string().min(2).max(255),
  done: z.boolean().default(false),
  parentTaskId: z.number().nullable().default(null),
})
export type Task = z.infer<typeof taskSchema>
export const taskWithSubtasksSchema = taskSchema.extend({
  subtasks: z.array(taskSchema),
})
export type TaskWithSubtasks = z.infer<typeof taskWithSubtasksSchema>

export const taskIdSchema = taskSchema.pick({ id: true })
export type TaskId = z.infer<typeof taskIdSchema>

export const taskTitleSchema = taskSchema.pick({ title: true })
export type TaskTitle = z.infer<typeof taskTitleSchema>

export const addTaskDataSchema = taskSchema
  .omit({ id: true })
  .partial({ done: true, parentTaskId: true })
export type AddTaskData = z.infer<typeof addTaskDataSchema>

const commandTasksGetSchema = z.object({
  command: z.literal(TASKS_COMMANDS.GET),
})

const commandTasksGetIdSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ID.GET),
})

const commandTasksAddSchema = z.object({
  command: z.literal(TASKS_COMMANDS.ADD),
  data: addTaskDataSchema,
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
  data: taskWithSubtasksSchema,
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
