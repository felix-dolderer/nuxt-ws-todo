import type { Message, Peer } from "crossws"
import { z } from "zod"
import { COMMANDS, TOPICS } from "~~/schemas"
import type { AddTaskData, Task, TaskId } from "~~/schemas/tasks"
import { tasksCommandSchema, tasksTopicSchema } from "~~/schemas/tasks"
import {
  dbAddTask,
  dbDeleteTask,
  dbGetTask,
  dbGetTasks,
  dbGetTaskWithSubtasks,
  dbUpdateTask,
} from "~~/server/db/tasks"

export const tasksWsMessageHandler = (peer: Peer, rawMessage: Message) => {
  const message = tasksCommandSchema.parse(rawMessage.json())
  const { command } = message
  if (command === COMMANDS.TASKS.ADD) {
    addTask(peer, message.data)
  } else if (command === COMMANDS.TASKS.ID.UPDATE) {
    updateTask(peer, message.data)
  } else if (command === COMMANDS.TASKS.ID.DELETE) {
    deleteTask(peer, message.data)
  }
}

export async function getTasks(peer: Peer) {
  peer.send({
    topic: TOPICS.TASKS.GET,
    data: await dbGetTasks(),
  })
}

export async function getTaskWithSubtasks(peer: Peer, { id }: TaskId) {
  peer.send({
    topic: TOPICS.TASKS.ID.GET,
    data: await dbGetTaskWithSubtasks(id),
  })
}

async function addTask(peer: Peer, addTaskData: AddTaskData) {
  const addedTask = await dbAddTask(addTaskData)
  publishTaskMessage({ topic: TOPICS.TASKS.ADD, data: addedTask }, peer)
}

async function updateTask(peer: Peer, task: Task) {
  const existingTask = await dbGetTask(task.id)
  const updatedTask = await dbUpdateTask(task)
  publishTaskMessage({ topic: TOPICS.TASKS.ID.UPDATE, data: updatedTask }, peer)

  if (existingTask.parentTaskId) {
    publishTaskMessage(
      { topic: TOPICS.TASKS.ID.UPDATE, data: existingTask },
      peer,
      existingTask.parentTaskId,
    )
  }

  if (updatedTask.parentTaskId) {
    publishTaskMessage(
      { topic: TOPICS.TASKS.ID.UPDATE, data: updatedTask },
      peer,
      updatedTask.parentTaskId,
    )
  }
}

async function deleteTask(peer: Peer, { id }: TaskId) {
  const deletedTask = await dbDeleteTask(id)
  publishTaskMessage({ topic: TOPICS.TASKS.ID.DELETE, data: deletedTask }, peer)

  if (deletedTask.parentTaskId) {
    publishTaskMessage(
      { topic: TOPICS.TASKS.ID.DELETE, data: deletedTask },
      peer,
      deletedTask.parentTaskId,
    )
  }
}

function publishTaskMessage(
  message: z.infer<typeof tasksTopicSchema>,
  peer: Peer,
  taskChannelId?: number,
) {
  if (message.topic === TOPICS.TASKS.GET) return

  peer.send(message)
  peer.publish(TOPICS.TASKS.CHANNEL, message)
  peer.publish(
    TOPICS.TASKS.ID.CHANNEL(taskChannelId || message.data.id),
    message,
  )
}
