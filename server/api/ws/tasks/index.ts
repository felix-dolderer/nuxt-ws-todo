import type { Peer } from "crossws"
import { z } from "zod"
import { COMMANDS, TOPICS } from "~/schemas"
import type { Task, TaskId, TaskTitle } from "~/schemas/tasks"
import { taskCommandSchema, taskTopicSchema } from "~/schemas/tasks"
import {
  dbAddTask,
  dbDeleteTask,
  dbGetTasks,
  dbUpdateTask,
} from "~/server/db/tasks"

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe(TOPICS.TASKS.GET)
    getTasks(peer)
  },
  message(peer, rawMessage) {
    const message = taskCommandSchema.parse(rawMessage.json())
    const { command } = message
    if (command === COMMANDS.TASKS.GET) {
      getTasks(peer)
    } else if (command === COMMANDS.TASKS.ADD) {
      addTask(peer, message.data)
    } else if (command === COMMANDS.TASKS.UPDATE) {
      updateTask(peer, message.data)
    } else if (command === COMMANDS.TASKS.DELETE) {
      deleteTask(peer, message.data)
    }
  },
  close(peer) {
    peer.unsubscribe(TOPICS.TASKS.GET)
  },
})

async function getTasks(peer: Peer) {
  peer.send({
    topic: TOPICS.TASKS.GET,
    data: await dbGetTasks(),
  })
}

async function addTask(peer: Peer, { title }: TaskTitle) {
  const addedTask = await dbAddTask(title)
  if (!addedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.ADD, data: addedTask }, peer)
}

async function updateTask(peer: Peer, task: Task) {
  const updatedTask = await dbUpdateTask(task)
  if (!updatedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.UPDATE, data: updatedTask }, peer)
}

async function deleteTask(peer: Peer, { id }: TaskId) {
  const deletedTask = await dbDeleteTask(id)
  if (!deletedTask) {
    return
  }
  publishTaskMessage({ topic: TOPICS.TASKS.DELETE, data: deletedTask }, peer)
}

function publishTaskMessage(
  message: z.infer<typeof taskTopicSchema>,
  peer: Peer,
) {
  peer.send(message)
  peer.publish(TOPICS.TASKS.GET, message)
}
