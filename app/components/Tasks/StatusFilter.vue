<script setup lang="ts">
const statusFilter = defineModel<StatusFilter>({
  required: true,
  default: "Open",
})
</script>

<template>
  <div class="block h-8">
    <USelect
      v-model="statusFilter"
      icon="i-lucide-filter"
      :items="[...statusFilterOptions]"
      class="w-48 float-right block clear-both"
    />
  </div>
</template>
