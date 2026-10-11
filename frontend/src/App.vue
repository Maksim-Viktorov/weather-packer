<script setup>
import { ref } from 'vue'

const city = ref('')   // reactive variable: when it changes, the page updates
</script>

<template>
  <h1>Weather Packer</h1>
  <input v-model="city" placeholder="Enter a city" />
  <p v-if="city">You typed: {{ city }}</p>
</template>