import type { Peer } from "crossws"
import { z } from "zod"
import { TOPICS } from "~~/schemas"
import type { Task, TaskId, TaskTitle } from "~~/schemas/tasks"
import { tasksTopicSchema } from "~~/schemas/tasks"
import {
  dbAddTask,
  dbDeleteTask,
  dbGetTask,
  dbGetTasks,
  dbUpdateTask,
} from "~~/server/db/tasks"

export async function getTasks(peer: Peer) {
  peer.send({
    topic: TOPICS.TASKS.GET,
    data: await dbGetTasks(),
  })
}

export async function getTask(peer: Peer, { id }: TaskId) {
  peer.send({
    topic: TOPICS.TASKS.ID.GET,
    data: await dbGetTask(id),
  })
}

export async function addTask(peer: Peer, { title }: TaskTitle) {
  const addedTask = await dbAddTask(title)
  if (!addedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.ADD, data: addedTask }, peer)
}

export async function updateTask(peer: Peer, task: Task) {
  const updatedTask = await dbUpdateTask(task)
  if (!updatedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.ID.UPDATE, data: updatedTask }, peer)
}

export async function deleteTask(peer: Peer, { id }: TaskId) {
  const deletedTask = await dbDeleteTask(id)
  if (!deletedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.ID.DELETE, data: deletedTask }, peer)
}

function publishTaskMessage(
  message: z.infer<typeof tasksTopicSchema>,
  peer: Peer,
) {
  if (message.topic === TOPICS.TASKS.GET) return

  peer.send(message)
  peer.publish(TOPICS.TASKS.CHANNEL, message)
  peer.publish(TOPICS.TASKS.ID.CHANNEL(message.data.id), message)
}
