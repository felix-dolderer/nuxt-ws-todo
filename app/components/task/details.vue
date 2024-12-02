<script setup lang="ts">
import { taskSchema, type Task } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emit = defineEmits<{
  updateTask: [task: Task]
}>()

function updateTask(task: Task) {
  const parsedTask = taskSchema.safeParse(task)
  if (!parsedTask.success) return
  emit('updateTask', parsedTask.data)
}
</script>

<template>
  <div>
    <TaskDetailsTitle :task="task" @update-task="updateTask" />
    <p v-if="task.parentTaskId">{{ task.parentTaskId }}</p>
    <p v-else><em>No parentTaskId</em></p>
    <TaskCompleteRestoreButton :task="task" @update-task="updateTask" />
  </div>
</template>
