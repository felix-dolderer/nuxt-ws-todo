import { tasks } from "~/server/db/tasks"
import type { Peer } from 'crossws'
import { COMMANDS, taskCommandSchema, taskTopicSchema, TOPICS } from "~/types/ws"
import type { Task, TaskId } from "~/types/ws"
import { z } from "zod"

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

function getTasks(peer: Peer) {
  peer.send({
    topic: TOPICS.TASKS.GET,
    data: tasks,
  })
}

function addTask(peer: Peer, task: Task) {
  tasks.push(task)
  publishTaskMessage({
    topic: TOPICS.TASKS.ADD,
    data: task,
  }, peer)
}

function updateTask(peer: Peer, task: Task) {
  const indexToUpdate = tasks.findIndex((t) => t.id === task.id)
  tasks[indexToUpdate] = task
  publishTaskMessage({
    topic: TOPICS.TASKS.UPDATE,
    data: task,
  }, peer)
}

function deleteTask(peer: Peer, task: TaskId) {
  const indexToDelete = tasks.findIndex((t) => t.id === task.id)
  tasks.splice(indexToDelete, 1)
  publishTaskMessage({
    topic: TOPICS.TASKS.DELETE,
    data: task,
  }, peer)
}

function publishTaskMessage(
  message: z.infer<typeof taskTopicSchema>,
  peer: Peer
) {
  peer.send(message)
  peer.publish(TOPICS.TASKS.GET, message)
}
