<script setup lang="ts">
// #region Imports

import type { TableColumn } from "@nuxt/ui"
import type { Task } from "~~/schemas/tasks"

const UButton = resolveComponent("UButton")
const TaskCompleteRestoreButton = resolveComponent("TaskCompleteRestoreButton")

// #endregion Imports

// #region Component Composition

const emits = defineEmits<{
  updateTask: [task: Task]
  deleteTask: [task: Task]
}>()

const { tasks } = defineProps<{ tasks: Task[] }>()

// #endregion Component Composition

// #region State

const statusFilterOptions = ["Open", "Done", "All"] as const
const statusFilter = ref<(typeof statusFilterOptions)[number]>("Open")

// #endregion State

// #region Functions

function fadeOutRow(elementId: string): Promise<void> {
  const target =
    document.getElementById(elementId)?.parentElement?.parentElement
  const motion = useMotion(target, {
    initial: { x: 0, opacity: 1 },
    leave: { x: 100, opacity: 0, transition: { duration: 200 } },
  })
  return new Promise(motion.leave)
}

// #endregion Function

// #region Table

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
  {
    accessorKey: "title",
    id: "Title",
    header: sortedColumnHeader,
    cell: ({ row }) =>
      h(
        UButton,
        {
          variant: "ghost",
          color: "neutral",
          to: { name: "tasks-taskId", params: { taskId: row.original.id } },
        },
        () => row.original.title,
      ),
  },
  {
    accessorKey: "done",
    header: "",
    filterFn: (row, _, desiredStatus) => {
      const { done } = row.original
      if (desiredStatus === "Open") return !done
      else if (desiredStatus === "Done") return done
      else return true
    },
    cell: ({ row: { original: task } }) => {
      const elementId = `tasksTableTask-${task.id}`
      return h(TaskCompleteRestoreButton, {
        id: elementId,
        task,
        onUpdateTask: async (task: Task) => {
          if (statusFilter.value !== "All") {
            await fadeOutRow(elementId)
          }
          emits("updateTask", task)
        },
      })
    },
  },
  {
    accessorKey: "id",
    header: "",
    cell: ({ row }) => {
      const task = row.original
      const elementId = `tasksTableTask-${task.id}`

      return h(
        UButton,
        {
          id: elementId,
          variant: "subtle",
          color: "error",
          icon: "i-lucide-trash",
          onClick: async () => {
            await fadeOutRow(elementId)
            emits("deleteTask", task)
          },
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
</script>

<template>
  <div>
    <div class="block h-8">
      <USelect
        v-model="statusFilter"
        icon="i-lucide-filter"
        :items="[...statusFilterOptions]"
        class="w-48 float-right block clear-both"
      />
    </div>
    <ClientOnly>
      <UTable
        id="tasksTable"
        :data="tasks"
        :columns="columns"
        v-model:sorting="sorting"
        v-model:column-filters="columnFilters"
        class="flex-1"
      />
    </ClientOnly>
  </div>
</template>
