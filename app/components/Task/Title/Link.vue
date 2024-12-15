<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

defineProps<{ task: Task }>()
</script>

<template>
  <span v-if="task.id == 0">{{ task.title }}</span>
  <NuxtLink
    v-else
    :to="{ name: 'tasks-taskId', params: { taskId: task.id } }"
  >
    <span>{{ task.title }}</span>
  </NuxtLink>
</template>
