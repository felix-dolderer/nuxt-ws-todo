<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { COMMANDS, taskCommandSchema, taskTopicSchema, TOPICS } from '~/types/ws';

const { data, close, send } = useWebSocket('ws://localhost:3000/api/ws/tasks')

type Task = {
  id: number
  title: string
  done: boolean
}

const tasks = ref<Task[]>([])

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

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)

const newTaskTitle = ref('')

function getNextId() {
  return (tasks.value.map(task => task.id).sort().pop() || 0) + 1
}

const addTask = () => {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.ADD, {
      id: getNextId(),
      title: newTaskTitle.value,
      done: false
    })
  ))
  newTaskTitle.value = ''
}

const toggleTask = ({ id, title, done }: Task) => {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.UPDATE, { id, title, done: !done })
  ))
}

const deleteTask = ({ id }: Task) => {
  send(JSON.stringify(
    buildTaskCommand(COMMANDS.TASKS.DELETE, { id })
  ))
}

function buildTaskCommand(command: string, data: any) {
  return taskCommandSchema.parse({ command, data })
}
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
