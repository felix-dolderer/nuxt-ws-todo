<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emits = defineEmits<{ updateTask: [task: Task] }>()

const saving = ref(false)

function updateTask() {
  saving.value = true
  emits("updateTask", { ...task, done: true })
}

watch(
  () => task.done,
  () => (saving.value = false),
)
</script>

<template>
  <UButton
    label="Complete"
    color="success"
    icon="i-lucide-circle-check-big"
    :loading="saving"
    variant="subtle"
    @click="updateTask"
  />
</template>
