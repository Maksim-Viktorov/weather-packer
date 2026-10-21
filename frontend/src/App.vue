<script setup>
import { computed, ref } from 'vue'
import SearchBar from './components/SearchBar.vue'
import PackingAdvice from './components/PackingAdvice.vue'
import ForecastTable from './components/ForecastTable.vue'
import AirQualityPanel from './components/AirQualityPanel.vue'

const weather = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// "Dublin, IE" or "Dublin, Ohio, US", so the user can see which place was found
const placeName = computed(() => {
  const { name, state, country } = weather.value.location
  return [name, state, country].filter(Boolean).join(', ')
})

// When Express is not running, Vite answers 502 with an empty body,
// so the body cannot be trusted to be JSON
async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function searchCity(city) {
  loading.value = true
  errorMessage.value = ''
  weather.value = null
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    const data = await readJson(response)
    if (!response.ok) {
      throw new Error(data?.error ?? `The server did not answer properly (HTTP ${response.status}). Please try again in a moment.`)
    }
    weather.value = data
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <h1>Weather Packer</h1>
  <SearchBar :loading="loading" @search="searchCity" />

  <p v-if="loading">Loading the forecast...</p>
  <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
  <template v-else-if="weather">
    <h2>{{ placeName }}</h2>
    <PackingAdvice :days="weather.days" />
    <ForecastTable :days="weather.days" />
    <AirQualityPanel :air-quality="weather.airQuality" />
  </template>
  <p v-else>Type the city you are travelling to and press Search.</p>
</template>
