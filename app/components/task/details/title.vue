<script setup lang="ts">
import { taskSchema, taskTitleSchema, type Task } from '~~/schemas/tasks'

const editing = ref(false)
const saving = ref(false)
const taskTitle = ref({ title: "" })
const { task } = defineProps<{ task: Task }>()
const emit = defineEmits<{ updateTask: [task: Task] }>()

function updateTask() {
  if (taskTitle.value.title === task.title) return reset()

  const parsedTask = taskSchema.safeParse({
    ...task,
    title: taskTitle.value.title,
  })
  if (!parsedTask.success) return
  saving.value = true
  emit("updateTask", parsedTask.data)
}

function reset() {
  editing.value = false
  saving.value = false
  taskTitle.value.title = task.title
}

watch(() => task.title, reset)

taskTitle.value.title = task.title
</script>

<template>
  <h2
    v-if="!editing"
    class="font-semibold text-2xl"
  >
    {{ task.title }}
    <UButton
      variant="subtle"
      color="neutral"
      icon="i-lucide-edit"
      class="ml-2"
      @click="editing = true"
    />
  </h2>
  <UForm
    v-else
    :schema="taskTitleSchema"
    :state="taskTitle"
    @submit="updateTask"
    class="w-full"
  >
    <UFormField
      name="title"
      class="w-full"
    >
      <UInput
        v-model="taskTitle.title"
        size="xl"
        :loading="saving"
        :disabled="saving"
        :variant="saving ? 'subtle' : 'outline'"
        class="w-full"
      >
        <template
          #trailing
          v-if="!saving"
        >
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
        </template>
      </UInput>
    </UFormField>
  </UForm>
</template>
