<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

defineProps<{ task: Task }>()
</script>

<template>
  <NuxtLink :to="{ name: 'tasks-taskId', params: { taskId: task.id } }">
    <span>{{ task.title }}</span>
  </NuxtLink>
</template>
