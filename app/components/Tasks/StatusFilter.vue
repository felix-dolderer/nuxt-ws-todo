<script setup lang="ts">
const statusFilter = defineModel<StatusFilter>({
  required: true,
  default: "Open",
})
</script>

<template>
  <USelect
    v-model="statusFilter"
    class="w-60 block"
    icon="i-lucide-filter"
    :items="[...statusFilterOptions]"
  />
</template>
