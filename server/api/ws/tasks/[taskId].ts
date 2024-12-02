import { z } from "zod"
import { COMMANDS, TOPICS } from "~~/schemas"
import { tasksCommandSchema } from "~~/schemas/tasks"
import { deleteTask, getTask, updateTask } from "~~/server/ws/tasks"

const API_WS_TASKS_ID_URL = "/api/ws/tasks/"

export default defineWebSocketHandler({
  open(peer) {
    const unparsedTaskId = peer.websocket.url?.split(API_WS_TASKS_ID_URL)[1]
    const taskId = z.coerce.number().parse(unparsedTaskId)
    peer.subscribe(TOPICS.TASKS.ID.CHANNEL(taskId))
    getTask(peer, { id: taskId })
  },
  message(peer, rawMessage) {
    const message = tasksCommandSchema.parse(rawMessage.json())
    const { command } = message
    if (command === COMMANDS.TASKS.ID.UPDATE) {
      updateTask(peer, message.data)
    } else if (command === COMMANDS.TASKS.ID.DELETE) {
      deleteTask(peer, message.data)
    }
  },
  close(peer) {
    const unparsedTaskId = peer.websocket.url?.split(API_WS_TASKS_ID_URL)[1]
    const taskId = z.coerce.number().parse(unparsedTaskId)
    peer.unsubscribe(TOPICS.TASKS.ID.CHANNEL(taskId))
  },
})
