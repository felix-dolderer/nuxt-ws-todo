<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { useRouteParams } from '@vueuse/router';
import { COMMANDS, TOPICS } from '~~/schemas';
import { type Task } from '~~/schemas/tasks';
import { tasksTopicSchema } from '~~/schemas/tasks';

definePageMeta({
  validate: async (route) => {
    return typeof route.params.taskId === "string" && /^\d+$/.test(route.params.taskId)
  }
})

const taskId = useRouteParams('taskId', '', { transform: Number })
const task = ref<Task>()

// #region WebSockets

const { host } = useRequestURL()
const { data, send, close } = useWebSocket(`ws://${host}/api/ws/tasks/${taskId.value}`)

watch(data, () => {
  if (!(data.value instanceof Blob)) return

  const reader = new FileReader()
  reader.onload = () => {
    const msgOptional = tasksTopicSchema.safeParse(
      JSON.parse(reader.result?.toString() || ""),
    )
    if (!msgOptional.success) return
    const msg = msgOptional.data

    if (msg.topic === TOPICS.TASKS.ID.GET) {
      task.value = msg.data
    } else if (msg.topic === TOPICS.TASKS.ID.UPDATE) {
      task.value = msg.data
    } else if (msg.topic === TOPICS.TASKS.ID.DELETE) {
      // TODO: Do something useful.
    }
  }
  reader.readAsText(data.value)
})

// #endregion WebSockets


// #region Methods

function saveTitle(title: string) {
  if (!task.value) return;

  send(
    JSON.stringify(
      _buildTasksCommand({
        command: COMMANDS.TASKS.ID.UPDATE,
        data: { ...task.value, title },
      }),
    ),
  )
}

// #endregion Methods

// #region Lifecycle

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)

// #endregion Lifecycle
</script>

<template>
  <div>
    <ClientOnly v-if="task!!">
      <TaskDetails :task="task" @save-title="saveTitle" />
    </ClientOnly>
  </div>
</template>
