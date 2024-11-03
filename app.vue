<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'

const { data, send, close } = useWebSocket('ws://localhost:3000/api/_ws')

type WsMessage = {
  user: string
  message: string
}
const webSocketData = ref<WsMessage[]>([])

watch(data, () => {
  if (data.value instanceof Blob) {
    const reader = new FileReader()
    reader.onload = () => {
      webSocketData.value.push(JSON.parse(reader.result?.toString() || ""))
    }
    reader.readAsText(data.value)
  }
})

onBeforeRouteLeave(() => close())
onBeforeUnmount(close)
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>Nuxt Websockets</h1>
    <div>
      <div v-for="message in webSocketData" :key="message.user">
        <p>{{ message.user }}: {{ message.message }}</p>
      </div>
    </div>
    <button @click="() => send('huhuhu')">test</button>
  </div>
</template>
