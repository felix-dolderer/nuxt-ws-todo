<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { COMMANDS, taskCommandSchema, taskTopicSchema, TOPICS } from '~/types/ws';
import type { Task } from '~/types/ws';

const { host } = useRequestURL()
const { data, close, send } = useWebSocket(`ws://${host}/api/ws/tasks`)

// #region State

const tasks = ref<Task[]>([])
const newTaskTitle = ref('')

// #endregion State

// #region Watchers

watch(data, () => {
  if (data.value instanceof Blob) {
    const reader = new FileReader()
    reader.onload = () => {
      const msgOptional = taskTopicSchema.safeParse(JSON.parse(reader.result?.toString() || ""))
      if (!msgOptional.success) return
      const msg = msgOptional.data

      if (msg.topic === TOPICS.TASKS.GET) {
        tasks.value = msg.data
      } else if (msg.topic === TOPICS.TASKS.ADD) {
        tasks.value.push(msg.data)
      } else if (msg.topic === TOPICS.TASKS.UPDATE) {
        const idx = tasks.value.findIndex(task => task.id === msg.data.id)
        tasks.value[idx] = msg.data
      } else if (msg.topic === TOPICS.TASKS.DELETE) {
        tasks.value = tasks.value.filter(task => task.id !== msg.data.id)
      }
    }
    reader.readAsText(data.value)
  }
})

// #endregion Watchers

// #region Methods

function getNextId() {
  return (tasks.value.map(task => task.id).sort().pop() || 0) + 1
}

function addTask() {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.ADD, {
      id: getNextId(),
      title: newTaskTitle.value,
      done: false,
    })
  ))
  newTaskTitle.value = ''
}

function toggleTask({ id, title, done }: Task) {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.UPDATE, { id, title, done: !done })
  ))
}

function deleteTask({ id }: Task) {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.DELETE, { id })
  ))
}

function buildTaskCommand(command: string, data: any) {
  return taskCommandSchema.parse({ command, data })
}

// #endregion Methods

// #region Lifecycle

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)

// #endregion Lifecycle
</script>

<template>
  <div>
    <h1>Tasks</h1>
    <div>
      <form @submit.prevent="addTask">
        <input v-model="newTaskTitle" type="text" placeholder="Task title" />
        <button type="submit">Add task</button>
      </form>
    </div>
    <div>
      <div v-for="(task, idx) in tasks" :key="task.title">
        <input :id="idx.toString()" type="checkbox" :checked="task.done" @change="() => toggleTask(task)" />
        <label :for="idx.toString()">
          <template v-if="!task.done">
            {{ task.title }}
          </template>
          <del v-else>{{ task.title }}</del>
        </label>
        <button v-if="task.done" @click="() => deleteTask(task)">x</button>
      </div>
    </div>
  </div>
</template>
