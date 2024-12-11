<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emits = defineEmits<{ updateTask: [task: Task] }>()

const saving = ref(false)

function updateTask() {
  saving.value = true
  emits("updateTask", { ...task, done: !task.done })
}

watch(
  () => task.done,
  () => (saving.value = false),
)
</script>

<template>
  <UButton
    :label="task.done ? 'Restore' : 'Complete'"
    :color="task.done ? 'neutral' : 'success'"
    :icon="task.done ? 'i-lucide-archive-restore' : 'i-lucide-circle-check-big'"
    :loading="saving"
    variant="subtle"
    @click="updateTask"
  />
</template>
