<template>
  <div>
    <NuxtRouteAnnouncer />
    <UContainer>
      <NuxtLink :to="{ name: 'index' }">
        <h1 class="text-4xl font-extrabold my-4">Tasks</h1>
      </NuxtLink>
      <NuxtPage />
    </UContainer>
  </div>
</template>
