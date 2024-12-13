<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emits = defineEmits<{ updateTask: [task: Task] }>()

const saving = ref(false)

function updateTask() {
  saving.value = true
  emits("updateTask", { ...task, done: false })
}

watch(
  () => task.done,
  () => (saving.value = false),
)
</script>

<template>
  <UButton
    label="Restore"
    color="neutral"
    icon="i-lucide-archive-restore"
    :loading="saving"
    variant="subtle"
    @click="updateTask"
  />
</template>
