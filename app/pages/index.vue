<script setup lang="ts">
// #region Imports
import { useWebSocket } from "@vueuse/core"
import { COMMANDS, TOPICS } from "~~/schemas"
import type { AddTaskData, Task, TaskId } from "~~/schemas/tasks"
import { tasksTopicSchema } from "~~/schemas/tasks"
// #endregion Imports

// #region State
const tasks = ref<Task[]>([])
// #endregion State

// #region WebSockets
const { host } = useRequestURL()
const { data, close, send } = useWebSocket(`ws://${host}/api/ws/tasks`)

watch(data, () => {
  if (!(data.value instanceof Blob)) return

  const reader = new FileReader()
  reader.onload = () => {
    const msgOptional = tasksTopicSchema.safeParse(
      JSON.parse(reader.result?.toString() || ""),
    )
    if (!msgOptional.success) return
    const msg = msgOptional.data

    if (msg.topic === TOPICS.TASKS.GET) {
      tasks.value = msg.data
    } else if (msg.topic === TOPICS.TASKS.ADD) {
      tasks.value = [...tasks.value, msg.data]
    } else if (msg.topic === TOPICS.TASKS.ID.UPDATE) {
      tasks.value = tasks.value.map((task) =>
        task.id === msg.data.id ? msg.data : task,
      )
    } else if (msg.topic === TOPICS.TASKS.ID.DELETE) {
      tasks.value = tasks.value.filter((task) => task.id !== msg.data.id)
    }
  }
  reader.readAsText(data.value)
})
// #endregion WebSockets

// #region Methods
function addTask(addTaskData: AddTaskData) {
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ADD,
    data: addTaskData,
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
}

function updateTask(task: Task) {
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ID.UPDATE,
    data: task,
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
}

function deleteTask({ id }: TaskId) {
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ID.DELETE,
    data: { id },
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
}
// #endregion Methods

// #region Lifecycle
onBeforeRouteLeave(() => close())
onBeforeUnmount(close)
// #endregion Lifecycle
</script>

<template>
  <div>
    <TasksAdd @add-task="addTask" />
    <TasksTable
      :tasks="tasks"
      @delete-task="deleteTask"
      @update-task="updateTask"
    />
  </div>
</template>
