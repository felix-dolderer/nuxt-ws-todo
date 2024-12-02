<script setup lang="ts">
import { taskTitleSchema, type Task } from "~~/schemas/tasks"

const editing = ref(false)
const saving = ref(false)
const taskTitle = ref({
  title: "",
})

const { task } = defineProps<{ task: Task }>()
const emit = defineEmits<{
  saveTitle: [title: string]
}>()

function saveTitle() {
  if (!taskTitleSchema.safeParse(taskTitle.value).success) {
    return
  }
  emit("saveTitle", taskTitle.value.title)
  saving.value = true
}

watch(
  () => task.title,
  () => {
    editing.value = false
    saving.value = false
    taskTitle.value.title = task.title
  },
)

taskTitle.value.title = task.title
</script>

<template>
  <div>
    <h2
      v-if="!editing"
      class="font-semibold text-2xl"
    >
      <UButton
        variant="subtle"
        color="neutral"
        icon="i-lucide-edit"
        @click="editing = true"
      />
      {{ task.title }}
    </h2>
    <UForm
      v-else
      :schema="taskTitleSchema"
      :state="taskTitle"
      @submit="saveTitle"
    >
      <UFormField name="title">
        <UInput
          v-model="taskTitle.title"
          icon="i-lucide-save"
          size="xl"
          :loading="saving"
          :disabled="saving"
          :variant="saving ? 'subtle' : 'outline'"
        >
          <template
            #trailing
            v-if="!saving"
          >
            <UButton
              color="neutral"
              variant="link"
              icon="i-lucide-circle-x"
              @click="editing = false"
            />
          </template>
          <template
            #leading
            v-if="!saving"
          >
            <UButton
              color="neutral"
              variant="link"
              icon="i-lucide-save"
              type="submit"
              :disabled="saving"
            />
          </template>
        </UInput>
      </UFormField>
    </UForm>
    <p v-if="task.parentTaskId">{{ task.parentTaskId }}</p>
    <p v-else><em>No parentTaskId</em></p>
    <p>
      Status:
      <UBadge
        :label="task.done ? 'Done' : 'Open'"
        :color="task.done ? 'success' : 'warning'"
        variant="subtle"
      />
    </p>
  </div>
</template>
