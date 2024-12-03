<script setup lang="ts">
import type { Task } from "~~/schemas/tasks"

defineProps<{ task: Task }>()
</script>

<template>
  <div>
    <span class="font-semibold mr-2">{{ task.id }}</span>
    <span>{{ task.title }}</span>
  </div>
</template>
