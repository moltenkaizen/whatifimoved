<template>
  <AddressCompare />
  <Analytics />
  <SpeedInsights />
</template>

<script setup>
import AddressCompare from './components/AddressCompare.vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<style scoped>
</style>
