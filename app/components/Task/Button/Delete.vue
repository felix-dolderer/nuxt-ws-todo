<script setup lang="ts">
import type { Task, TaskId } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emits = defineEmits<{ deleteTask: [task: TaskId] }>()

const saving = ref(false)

function deleteTask() {
  saving.value = true
  emits("deleteTask", task)
}
</script>

<template>
  <UButton
    label="Delete"
    color="error"
    icon="i-lucide-trash"
    :loading="saving"
    variant="subtle"
    @click="deleteTask"
  />
</template>
