// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      reasoningApiUrl: process.env.NUXT_PUBLIC_REASONING_API_URL || '',
    },
  },

  app: {
    head: {
      title: 'WejdanAI - Reasoning Assistant',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Advanced AI Reasoning Assistant powered by o1, Gemini, DeepSeek' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'WejdanAI' },
        { name: 'theme-color', content: '#020617' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/icon-512.svg' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-512.svg' },
      ],
    },
  },

  compatibilityDate: '2025-02-05',
})