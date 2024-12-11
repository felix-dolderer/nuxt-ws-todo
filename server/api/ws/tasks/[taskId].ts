import type { Peer } from "crossws"
import { z } from "zod"
import { TOPICS } from "~~/schemas"
import { getTaskWithSubtasks, tasksWsMessageHandler } from "~~/server/ws/tasks"

const API_WS_TASKS_ID_URL = "/api/ws/tasks/"

export default defineWebSocketHandler({
  open(peer) {
    const taskId = getTaskIdFromPeer(peer)
    peer.subscribe(TOPICS.TASKS.ID.CHANNEL(taskId))
    getTaskWithSubtasks(peer, { id: taskId })
  },
  message: tasksWsMessageHandler,
  close(peer) {
    const taskId = getTaskIdFromPeer(peer)
    peer.unsubscribe(TOPICS.TASKS.ID.CHANNEL(taskId))
  },
})

function getTaskIdFromPeer(peer: Peer) {
  const unparsedTaskId = peer.websocket.url?.split(API_WS_TASKS_ID_URL)[1]
  return z.coerce.number().parse(unparsedTaskId)
}
