import { COMMANDS, TOPICS } from "~~/schemas"
import { tasksCommandSchema } from "~~/schemas/tasks"
import { addTask, deleteTask, getTasks, updateTask } from "~~/server/ws/tasks"

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe(TOPICS.TASKS.CHANNEL)
    getTasks(peer)
  },
  message(peer, rawMessage) {
    const message = tasksCommandSchema.parse(rawMessage.json())
    const { command } = message
    if (command === COMMANDS.TASKS.ADD) {
      addTask(peer, message.data)
    } else if (command === COMMANDS.TASKS.ID.UPDATE) {
      updateTask(peer, message.data)
    } else if (command === COMMANDS.TASKS.ID.DELETE) {
      deleteTask(peer, message.data)
    }
  },
  close(peer) {
    peer.unsubscribe(TOPICS.TASKS.CHANNEL)
  },
})
