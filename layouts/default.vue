<script setup>
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <div>
    <slot />
    <SpeedInsights />
  </div>
</template>
