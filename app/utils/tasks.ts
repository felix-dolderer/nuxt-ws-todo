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
  return new Promise((resolve, reject) => {
    const parseAndValidate = (jsonStr: string) => {
      const parsedMsg = tasksTopicSchema.safeParse(JSON.parse(jsonStr))
      if (!parsedMsg.success) return reject()
      resolve(parsedMsg.data)
    }

    if (typeof wsMessage == "string") return parseAndValidate(wsMessage)
    if (!(wsMessage instanceof Blob)) return reject()
    const reader = new FileReader()
    reader.readAsText(wsMessage)
    reader.onload = () => parseAndValidate(reader.result?.toString() || "")
  })
}
