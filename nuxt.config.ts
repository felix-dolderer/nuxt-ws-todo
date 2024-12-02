import { defaultConfig } from "./defaultConfig"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  nitro: {
    experimental: { websocket: true },
    esbuild: { options: { target: "ESNext" } },
  },
  modules: ["@nuxt/ui", "@vueuse/motion/nuxt"],
  css: ["~/assets/css/main.css"],
  vite: { build: { target: "ESNext" } },
  future: { compatibilityVersion: 4 },
  runtimeConfig: {
    db: {
      url: defaultConfig.db.url
    }
  }
})
