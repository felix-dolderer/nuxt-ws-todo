<script setup lang="ts">
import type { Task, TaskId } from "~~/schemas/tasks"
import { taskIdSchema, taskSchema } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emit = defineEmits<{
  updateTask: [task: Task]
  deleteTask: [task: TaskId]
}>()

function updateTask(task: Task) {
  const parsedTask = taskSchema.safeParse(task)
  if (!parsedTask.success) return
  emit("updateTask", parsedTask.data)
}

function deleteTask(task: TaskId) {
  const parsedTask = taskIdSchema.safeParse(task)
  if (!parsedTask.success) return
  emit("deleteTask", parsedTask.data)
}
</script>

<template>
  <div>
    <TaskDetailsTitle
      :task="task"
      @update-task="updateTask"
    />
    <TaskDetailsParentTask
      :task="task"
      @update-task="updateTask"
    />
    <TaskButtonComplete
      v-if="!task.done"
      :task="task"
      @update-task="updateTask"
    />
    <div v-else>
      <TaskButtonRestore
        :task="task"
        class="mr-2"
        @update-task="updateTask"
      />
      <TaskButtonDelete
        :task="task"
        @delete-task="deleteTask"
      />
    </div>
  </div>
</template>
