<script setup lang="ts">
import { z } from "zod"
import { addTaskDataSchema, type AddTaskData } from "~~/schemas/tasks"

// #region Component Composition
const props = defineProps<{ parentTaskId?: number }>()
const emits = defineEmits<{ addTask: [addTaskData: AddTaskData] }>()
// #endregion Component Composition

// #region Shortcuts
defineShortcuts({
  "+": focusAddTaskInput,
})
// #endregion Shortcuts

// #region State
const newTask = ref<AddTaskData>({
  title: "",
  parentTaskId: props.parentTaskId,
})
const addTaskInput = useTemplateRef("addTaskInput")
// #endregion State

// #region Methods
function addTask() {
  const parsedAddTaskData = addTaskDataSchema.safeParse(newTask.value)
  if (!parsedAddTaskData.success) return
  emits("addTask", parsedAddTaskData.data)
  newTask.value.title = ""
  setTimeout(focusAddTaskInput)
}

function focusAddTaskInput() {
  addTaskInput.value?.inputRef?.focus()
}
// #endregion Methods
</script>

<template>
  <div>
    <UForm
      :schema="addTaskDataSchema.or(z.object({ title: z.literal('') }))"
      :state="newTask"
      @submit.prevent="addTask"
      class="w-full"
    >
      <UFormField name="title">
        <UFieldGroup class="w-full">
          <UInput
            ref="addTaskInput"
            v-model="newTask.title"
            placeholder="New Task"
            type="text"
            class="flex-1"
          >
            <template #trailing>
              <UKbd value="+" />
            </template>
          </UInput>
          <UButton
            type="submit"
            color="neutral"
            variant="subtle"
            label="Add Task"
          />
        </UFieldGroup>
      </UFormField>
    </UForm>
  </div>
</template>
