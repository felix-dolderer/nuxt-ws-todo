import {
  tasksCommandSchema,
  tasksTopicSchema,
  type TaskTopicMessage,
} from "~~/schemas/tasks"

export const _buildTasksCommand = tasksCommandSchema.safeParse

export const statusFilterOptions = ["Open", "Done", "All"] as const
export type StatusFilter = (typeof statusFilterOptions)[number]

export const peerId = ref<string>()

export const latestUpdatePeerId = ref<string>()

export const taskMessageParser = (
  wsMessage: any,
): Promise<TaskTopicMessage> => {
  if (!(wsMessage instanceof Blob)) {
    return new Promise((_, reject) => reject)
  }

  const reader = new FileReader()
  reader.readAsText(wsMessage)

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const parsedMsg = tasksTopicSchema.safeParse(
        JSON.parse(reader.result?.toString() || ""),
      )
      if (!parsedMsg.success) return reject()
      resolve(parsedMsg.data)
    }
  })
}
