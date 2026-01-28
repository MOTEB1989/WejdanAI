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
    // Private keys (server-side only, never exposed to client)
    postgresUrl: process.env.POSTGRES_URL || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    azureStaticWebAppsApiToken: process.env.AZURE_STATIC_WEB_APPS_API_TOKEN || '',
    
    // Public keys (exposed to client)
    public: {
      // Add any public API keys here if needed
    },
  },

  compatibilityDate: '2025-02-05',
})