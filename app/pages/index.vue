<script setup lang="ts">
// #region Imports

import { useWebSocket } from "@vueuse/core"
import type { z } from "zod"
import { COMMANDS, TOPICS } from "~~/schemas"
import type { Task } from "~~/schemas/tasks"
import { tasksCommandSchema, tasksTopicSchema } from "~~/schemas/tasks"

// #endregion Imports

// #region State

const tasks = ref<Task[]>([])
const newTask = ref<Task>({ id: 0, title: "", done: false, parentTaskId: null })

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

function addTask() {
  send(
    JSON.stringify(
      _buildTasksCommand({ command: COMMANDS.TASKS.ADD, data: newTask.value }),
    ),
  )
  newTask.value.title = ""
}

function toggleTask(task: Task) {
  send(
    JSON.stringify(
      _buildTasksCommand({
        command: COMMANDS.TASKS.ID.UPDATE,
        data: { ...task, done: !task.done },
      }),
    ),
  )
}

function deleteTask({ id }: Task) {
  send(
    JSON.stringify(
      _buildTasksCommand({ command: COMMANDS.TASKS.ID.DELETE, data: { id } }),
    ),
  )
}

function _buildTasksCommand(taskCommand: z.infer<typeof tasksCommandSchema>) {
  return tasksCommandSchema.parse(taskCommand)
}

// #endregion Methods

// #region Lifecycle

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)

// #endregion Lifecycle
</script>

<template>
  <div>
    <h1 class="text-4xl font-extrabold my-4">Tasks</h1>
    <form
      @submit.prevent="addTask"
      class="w-full mb-8"
    >
      <UButtonGroup class="w-full">
        <UInput
          v-model="newTask.title"
          placeholder="New Task"
          type="text"
          class="flex-1"
        />
        <UButton
          type="submit"
          color="neutral"
          variant="subtle"
        >
          Add Task
        </UButton>
      </UButtonGroup>
    </form>
    <TasksTable
      :tasks="tasks"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>
