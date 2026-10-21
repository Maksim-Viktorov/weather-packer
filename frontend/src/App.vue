<script setup>
import { computed, ref } from 'vue'
import { getJson } from './api.js'
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

async function searchCity(city) {
  loading.value = true
  errorMessage.value = ''
  weather.value = null
  try {
    weather.value = await getJson(`/api/weather?city=${encodeURIComponent(city)}`)
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
