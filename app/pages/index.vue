<script setup lang="ts">
// #region Imports

import { useWebSocket } from "@vueuse/core"
import { z } from "zod";
import { COMMANDS, TOPICS } from "~~/schemas"
import type { Task, TaskTitle } from "~~/schemas/tasks"
import { tasksTopicSchema, taskTitleSchema } from "~~/schemas/tasks"

// #endregion Imports

// #region Shortcuts

defineShortcuts({
  "+": focusAddTaskInput,
})

// #endregion Shortcuts

// #region State

const tasks = ref<Task[]>([])
const newTask = ref<TaskTitle>({ title: "" })
const addTaskInput = useTemplateRef('addTaskInput')

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
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ADD,
    data: newTask.value,
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
  newTask.value.title = ""
  setTimeout(focusAddTaskInput)
}

function updateTask(task: Task) {
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ID.UPDATE,
    data: task,
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
}

function deleteTask({ id }: Task) {
  const command = _buildTasksCommand({
    command: COMMANDS.TASKS.ID.DELETE,
    data: { id },
  })
  if (!command.success) return
  send(JSON.stringify(command.data))
}

function focusAddTaskInput() {
  addTaskInput.value?.inputRef?.focus()
}

// #endregion Methods

// #region Lifecycle

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)

// #endregion Lifecycle
</script>

<template>
  <div>
    <UForm
      :schema="taskTitleSchema.or(z.object({ title: z.literal('') }))"
      :state="newTask"
      @submit.prevent="addTask"
      class="w-full mb-8"
    >
      <UFormField name="title">
        <UButtonGroup class="w-full">
          <UInput
            ref="addTaskInput"
            v-model="newTask.title"
            placeholder="New Task"
            type="text"
            class="flex-1"
          >
            <template #trailing>
              <UKbd value="+" />
            </template>
          </UInput>
          <UButton
            type="submit"
            color="neutral"
            variant="subtle"
            label="Add Task"
          />
        </UButtonGroup>
      </UFormField>
    </UForm>
    <TasksTable
      :tasks="tasks"
      @delete-task="deleteTask"
      @update-task="updateTask"
    />
  </div>
</template>
