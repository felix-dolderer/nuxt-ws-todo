<script setup lang="ts">
import { useWebSocket } from "@vueuse/core"
import type { z } from "zod"
import { COMMANDS, TOPICS } from "~/schemas"
import type { Task } from "~/schemas/tasks"
import { taskCommandSchema, taskTopicSchema } from "~/schemas/tasks"

const { host } = useRequestURL()
const { data, close, send } = useWebSocket(`ws://${host}/api/ws/tasks`)

// #region State

const tasks = ref<Task[]>([])
const newTask = ref<Task>({ id: 0, title: "", done: false })

const statusFilterOptions = ["Open", "Done", "All"]
const statusFilter = ref("Open")

// #endregion State

// #region Computed

const filteredTasks = computed(() => {
  if (statusFilter.value === "Open") {
    return tasks.value.filter((task) => !task.done)
  } else if (statusFilter.value === "Done") {
    return tasks.value.filter((task) => task.done)
  } else {
    return tasks.value
  }
})

// #endregion Computed

// #region Watchers

watch(data, () => {
  if (data.value instanceof Blob) {
    const reader = new FileReader()
    reader.onload = () => {
      const msgOptional = taskTopicSchema.safeParse(
        JSON.parse(reader.result?.toString() || ""),
      )
      if (!msgOptional.success) return
      const msg = msgOptional.data

      if (msg.topic === TOPICS.TASKS.GET) {
        tasks.value = msg.data
      } else if (msg.topic === TOPICS.TASKS.ADD) {
        tasks.value.push(msg.data)
      } else if (msg.topic === TOPICS.TASKS.UPDATE) {
        const idx = tasks.value.findIndex((task) => task.id === msg.data.id)
        tasks.value[idx] = msg.data
      } else if (msg.topic === TOPICS.TASKS.DELETE) {
        tasks.value = tasks.value.filter((task) => task.id !== msg.data.id)
      }
    }
    reader.readAsText(data.value)
  }
})

// #endregion Watchers

// #region Methods

function addTask() {
  send(
    JSON.stringify(
      buildTaskCommand({
        command: COMMANDS.TASKS.ADD,
        data: newTask.value,
      }),
    ),
  )
  newTask.value.title = ""
}

function toggleTask({ id, title, done }: Task) {
  send(
    JSON.stringify(
      buildTaskCommand({
        command: COMMANDS.TASKS.UPDATE,
        data: { id, title, done },
      }),
    ),
  )
}

function deleteTask({ id }: Task) {
  send(
    JSON.stringify(
      buildTaskCommand({
        command: COMMANDS.TASKS.DELETE,
        data: { id },
      }),
    ),
  )
}

function buildTaskCommand(taskCommand: z.infer<typeof taskCommandSchema>) {
  return taskCommandSchema.parse(taskCommand)
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
        >
          Add task
        </UButton>
      </UButtonGroup>
    </form>
    <div class="block h-8">
      <USelect
        v-model="statusFilter"
        icon="i-lucide-filter"
        :items="statusFilterOptions"
        class="w-48 float-right block clear-both"
      />
    </div>
    <div>
      <UCard
        v-for="task in filteredTasks"
        :key="task.title"
        class="flex my-2"
        :ui="{ body: 'p-4 sm:p-6 flex flex-1 flex-wrap' }"
      >
        <UCheckbox
          v-model="task.done"
          class="flex-1 py-1.5"
          @click="() => toggleTask(task)"
        >
          <template #label>
            <template v-if="!task.done">{{ task.title }}</template>
            <del v-else>{{ task.title }}</del>
          </template>
        </UCheckbox>
        <UButton
          v-if="task.done"
          color="error"
          icon="i-lucide-trash-2"
          label="Delete Task"
          @click="() => deleteTask(task)"
        />
      </UCard>
    </div>
  </div>
</template>
