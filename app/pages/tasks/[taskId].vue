<script setup lang="ts">
import { useRouteParams } from '@vueuse/router';

definePageMeta({
  validate: async (route) => {
    return typeof route.params.taskId === "string" && /^\d+$/.test(route.params.taskId)
  }
})

const taskId = useRouteParams('taskId', '', { transform: Number })
</script>

<template>
  <div>
    {{ taskId }}
  </div>
</template>

