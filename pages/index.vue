<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { useWebSocket } from "@vueuse/core"
import { z } from "zod"
import { COMMANDS, TOPICS } from "~/schemas"
import type { Task } from "~/schemas/tasks"
import { taskCommandSchema, taskTopicSchema } from "~/schemas/tasks"

const UButton = resolveComponent("UButton")

const { host } = useRequestURL()
const { data, close, send } = useWebSocket(`ws://${host}/api/ws/tasks`)

// #region State

const tasks = ref<Task[]>([])
const newTask = ref<Task>({ id: 0, title: "", done: false })

const statusFilterOptions = ["Open", "Done", "All"]
const statusFilter = ref("Open")

// #endregion State

// #region Table

const tasksUTable = useTemplateRef("tasksUTable")

const sortedColumnHeader: TableColumn<Task>["header"] = ({ column }) => {
  const isSorted = column.getIsSorted()

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label: column.id,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
  })
}

const columns: TableColumn<Task>[] = [
  {
    accessorKey: "id",
    header: sortedColumnHeader,
  },
  { accessorKey: "title", id: "Title", header: sortedColumnHeader },
  {
    accessorKey: "done",
    header: "",
    filterFn: (row, _, desiredStatus) => {
      const { done } = row.original
      if (desiredStatus === "Open") {
        return !done
      } else if (desiredStatus === "Done") {
        return done
      } else {
        return true
      }
    },
    cell: ({ row }) => {
      const task = row.original

      const done = task.done
      const color = done ? "warning" : "success"
      const icon = done
        ? "i-lucide-archive-restore"
        : "i-lucide-circle-check-big"
      const text = done ? "Restore" : "Complete"

      return h(
        UButton,
        { variant: "subtle", color, icon, onClick: () => toggleTask(task) },
        () => text,
      )
    },
  },
  {
    accessorKey: "id",
    header: "",
    cell: ({ row }) => {
      const task = row.original

      return h(
        UButton,
        {
          variant: "subtle",
          color: "error",
          icon: "i-lucide-trash",
          onClick: () => deleteTask(task),
        },
        () => "Delete",
      )
    },
  },
]

const sorting = ref([{ id: "id", desc: false }])

const columnFilters = computed(() => [
  { id: "done", value: statusFilter.value },
])

// #endregion Table

// #region Watchers

watch(data, () => {
  if (!(data.value instanceof Blob)) return

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
      tasks.value = [...tasks.value, msg.data]
    } else if (msg.topic === TOPICS.TASKS.UPDATE) {
      tasks.value = tasks.value.map((task) =>
        task.id === msg.data.id ? msg.data : task,
      )
    } else if (msg.topic === TOPICS.TASKS.DELETE) {
      tasks.value = tasks.value.filter((task) => task.id !== msg.data.id)
    }
  }
  reader.readAsText(data.value)
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
        data: { id, title, done: !done },
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
    <UTable
      ref="tasksUTable"
      :data="tasks"
      :columns="columns"
      v-model:sorting="sorting"
      v-model:column-filters="columnFilters"
      class="flex-1"
    />
  </div>
</template>
