<script setup lang="ts">
import { refDebounced } from "@vueuse/core"
import { taskSchema, type Task } from "~~/schemas/tasks"

const { task } = defineProps<{ task: Task }>()
const emit = defineEmits<{ updateTask: [task: Task] }>()

const emptyTask: Task = {
  id: 0,
  title: "No parent task",
  parentTaskId: null,
  done: false,
}
const selectedParentTask = ref<Task>(emptyTask)
const searchTerm = ref("")
const searchTermDebounced = refDebounced(searchTerm, 300)

const availableTasks = useFetch("/api/rest/tasks", {
  query: { query: searchTermDebounced },
})

const editing = ref(false)
const saving = ref(false)
const parentTask = computed(() =>
  availableTasks.data.value?.find((t) => t.id === task.parentTaskId),
)
const selectableTasks = computed(() => {
  const tasks: Task[] = [
    ...(availableTasks.data.value?.filter(
      (availableTask) => availableTask.id !== task.id,
    ) || []),
  ]
  tasks.unshift(emptyTask)
  return tasks
})

function updateTask() {
  if ([task.id, task.parentTaskId].includes(selectedParentTask.value.id)) {
    return reset()
  }

  const parsedTask = taskSchema.safeParse({
    ...task,
    parentTaskId: selectedParentTask.value.id,
  })
  if (!parsedTask.success) return
  saving.value = true
  emit("updateTask", parsedTask.data)
}

function reset() {
  editing.value = false
  saving.value = false
  selectedParentTask.value = parentTask.value || emptyTask
}

watch(() => task.parentTaskId, reset)
</script>

<template>
  <div class="mb-2">
    <div
      v-if="!editing"
      class="flex"
    >
      <div v-if="task.parentTaskId">
        <TaskTitleLink
          v-if="parentTask"
          :task="parentTask"
        />
        <p v-else>{{ task.parentTaskId }}</p>
      </div>
      <p v-else><em>No parentTaskId</em></p>
      <UButton
        variant="subtle"
        color="neutral"
        icon="i-lucide-edit"
        class="ml-2"
        @click="editing = true"
      />
    </div>
    <UForm
      v-else
      :schema="taskSchema.optional()"
      :state="selectedParentTask"
      @submit="updateTask"
      class="flex w-full"
    >
      <USelectMenu
        v-model="selectedParentTask"
        v-model:search-term="searchTerm"
        :items="selectableTasks"
        :loading="availableTasks.status.value !== 'success'"
        :ignore-filter="true"
        class="flex-1"
      >
        <TaskTitleLink
          v-if="selectedParentTask"
          :task="selectedParentTask"
          class="truncate"
        />
        <p v-else>Select</p>
        <template #item-label="{ item }">
          <TaskTitleLink
            :task="item"
            class="truncate"
          />
        </template>
      </USelectMenu>
      <UButton
        color="success"
        variant="link"
        icon="i-lucide-save"
        type="submit"
      />
      <UButton
        color="neutral"
        variant="link"
        icon="i-lucide-circle-x"
        @click="editing = false"
      />
    </UForm>
  </div>
</template>
