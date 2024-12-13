<script setup lang="ts">
// #region Imports

import type { TableColumn } from "@nuxt/ui"
import type { Task, TaskId } from "~~/schemas/tasks"

const UButton = resolveComponent("UButton")
const DeleteButton = resolveComponent("TaskButtonDelete")
const CompleteButton = resolveComponent("TaskButtonComplete")
const RestoreButton = resolveComponent("TaskButtonRestore")

// #endregion Imports

// #region Component Composition

const emits = defineEmits<{
  updateTask: [task: Task]
  deleteTask: [task: TaskId]
}>()

const { tasks } = defineProps<{ tasks: Task[] }>()

// #endregion Component Composition

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
      const onUpdateTask = async (updatedTask: Task) => {
        if (
          statusFilter.value !== "All" &&
          task.done !== updatedTask.done &&
          ((updatedTask.done && statusFilter.value === "Open") ||
            (statusFilter.value === "Done" && !updatedTask.done))
        ) {
          await fadeOutRow(elementId)
        }
        emits("updateTask", updatedTask)
      }
      if (!task.done) {
        return h(CompleteButton, {
          id: elementId,
          task,
          onUpdateTask,
        })
      }
      return h(RestoreButton, {
        id: elementId,
        task,
        onUpdateTask,
      })
    },
  },
  {
    accessorKey: "id",
    header: "",
    cell: ({ row: { original: task } }) => {
      const elementId = `tasksTableTask-${task.id}`
      return h(DeleteButton, {
        id: elementId,
        task,
        onDeleteTask: async (task: TaskId) => {
          await fadeOutRow(elementId)
          emits("deleteTask", task)
        },
      })
    },
  },
]

const sorting = ref([{ id: "id", desc: false }])

const statusFilter = ref<StatusFilter>("Open")
const columnFilters = computed(() => [
  { id: "done", value: statusFilter.value },
])

// #endregion Table
</script>

<template>
  <div>
    <TasksStatusFilter v-model="statusFilter" />
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
