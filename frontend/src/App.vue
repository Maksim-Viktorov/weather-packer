<script setup>
import { ref } from 'vue'

const city = ref('')   // reactive variable: when it changes, the page updates
const weather = ref(null)

async function searchCity() {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city.value)}`)
  weather.value = await response.json()
}
</script>

<template>
  <h1>Weather Packer</h1>
  <form @submit.prevent="searchCity">
    <input v-model="city" placeholder="Where are you going?" />
    <button type="submit">Search</button>
  </form>
  <pre v-if="weather">{{ weather }}</pre>
</template>
