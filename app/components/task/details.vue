<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

defineProps<{ task: Task }>()
</script>

<template>
  <div>
    <h1>{{ task.title }}</h1>
    <p v-if="task.parentTaskId">{{ task.parentTaskId }}</p>
    <p v-else><em>No parentTaskId</em></p>
  </div>
</template>
