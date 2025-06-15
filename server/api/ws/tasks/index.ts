import { TOPICS } from "~~/schemas"
import { getTasks, tasksWsMessageHandler } from "~~/server/ws/tasks"

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe(TOPICS.TASKS.CHANNEL)
    getTasks(peer)
  },
  message: tasksWsMessageHandler,
  close: (peer) => peer.unsubscribe(TOPICS.TASKS.CHANNEL),
})
