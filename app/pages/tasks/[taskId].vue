<script setup lang="ts">
// #region Imports
import { useWebSocket } from "@vueuse/core"
import { useRouteParams } from "@vueuse/router"
import { COMMANDS, TOPICS } from "~~/schemas"
import type {
  AddTaskData,
  Task,
  TaskId,
  TaskWithSubtasks,
} from "~~/schemas/tasks"
import { tasksTopicSchema } from "~~/schemas/tasks"
// #endregion Imports

definePageMeta({
  validate: async (route) => {
    return (
      typeof route.params.taskId === "string" &&
      /^\d+$/.test(route.params.taskId)
    )
  },
})

const taskId = useRouteParams("taskId", "", { transform: Number })
const fetchedTask = await $fetch(`/api/rest/tasks/${taskId.value}`)
const task = ref<TaskWithSubtasks>(fetchedTask)

// #region WebSockets
const { host } = useRequestURL()
const { data, send, close } = useWebSocket(
  `ws://${host}/api/ws/tasks/${taskId.value}`,
)

watch(data, () => {
  if (!(data.value instanceof Blob)) return

  const reader = new FileReader()
  reader.onload = () => {
    const msgOptional = tasksTopicSchema.safeParse(
      JSON.parse(reader.result?.toString() || ""),
    )
    if (!msgOptional.success) return
    const msg = msgOptional.data

    if (msg.topic === TOPICS.TASKS.ID.GET) {
      task.value = msg.data
    } else if (msg.topic === TOPICS.TASKS.ADD) {
      task.value.subtasks.push(msg.data)
    } else if (msg.topic === TOPICS.TASKS.ID.UPDATE) {
      // If the update is for the task itself
      if (task.value.id === msg.data.id) {
        // Update the task.
        task.value = {
          ...task.value,
          ...msg.data,
        }
      }

      // The update is for a subtask.
      else {
        // Remove a subtask.
        if (msg.data.parentTaskId !== task.value.id) {
          removeSubtask(msg.data)
        }
        // Update a subtask.
        else if (task.value.subtasks.some(({ id }) => id === msg.data.id)) {
          task.value.subtasks = task.value.subtasks.map((subtask) =>
            subtask.id === msg.data.id ? msg.data : subtask,
          )
        }
        // Add a subtask.
        else {
          task.value.subtasks.push(msg.data)
        }
      }
    } else if (msg.topic === TOPICS.TASKS.ID.DELETE) {
      // If the task is deleted
      if (task.value.id === msg.data.id) {
        // TODO: Do something useful.
      }
      // If a subtask is deleted
      else {
        removeSubtask(msg.data)
      }
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
  console.log(command)
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

function removeSubtask(subtask: TaskId) {
  if (!task.value) return
  task.value.subtasks = task.value?.subtasks.filter(
    ({ id }) => id !== subtask.id,
  )
}
// #endregion Methods

// #region Lifecycle
onBeforeRouteLeave(() => close())
onBeforeUnmount(close)
// #endregion Lifecycle
</script>

<template>
  <div>
    <TaskDetails
      :task="task"
      @update-task="updateTask"
    />
    <h2
      v-if="task.subtasks.length > 0"
      class="font-semibold text-xl mt-8"
    >
      Subtasks
    </h2>
    <div class="flex flex-wrap">
      <UCard class="m-4 flex-auto">
        <TasksAdd
          :parent-task-id="taskId"
          @add-task="addTask"
        />
      </UCard>
      <UCard
        v-for="subtask in task.subtasks"
        class="m-4 flex-auto"
      >
        <TaskDetails
          :task="subtask"
          @update-task="updateTask"
        />
      </UCard>
    </div>
  </div>
</template>
