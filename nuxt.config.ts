// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  nitro: {
    experimental: { websocket: true },
    esbuild: { options: { target: "ESNext" } },
  },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: { build: { target: "ESNext" } },
  future: { compatibilityVersion: 4 },
})
