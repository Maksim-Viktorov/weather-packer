<script setup>
import { computed, ref } from 'vue'
import { getJson } from './api.js'
import SearchBar from './components/SearchBar.vue'
import PackingAdvice from './components/PackingAdvice.vue'
import ForecastTable from './components/ForecastTable.vue'
import AirQualityPanel from './components/AirQualityPanel.vue'
import BestTimePlanner from './components/BestTimePlanner.vue'

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
  <header class="hero">
    <div class="hero-inner">
      <h1>Weather Packer</h1>
      <p class="tagline">Know what to pack, and when to head outside, before you travel.</p>
      <SearchBar :loading="loading" @search="searchCity" />
    </div>
  </header>

  <main class="content">
    <p v-if="loading" class="card status" role="status"><span class="spinner" aria-hidden="true"></span>Loading the forecast...</p>
    <p v-else-if="errorMessage" class="card status error" role="alert">{{ errorMessage }}</p>
    <template v-else-if="weather">
      <h2 class="card place">{{ placeName }}</h2>
      <PackingAdvice :days="weather.days" />
      <ForecastTable :days="weather.days" />
      <AirQualityPanel :air-quality="weather.airQuality" />
      <BestTimePlanner :location="weather.location" />
    </template>
    <div v-else class="card status">
      <p>Type the city you are travelling to and press Search.</p>
      <p class="tip">
        You will get packing advice, a 3-day forecast, air quality warnings and the best times to be outside.
        Several places share a name? Add a country code, like Dublin, US.
      </p>
    </div>
  </main>

  <footer class="footer">
    Weather and air pollution data from OpenWeatherMap.
    Health guidance adapted from the US EPA and the European Environment Agency.
  </footer>
</template>

<style scoped>
.hero {
  padding: 36px 0 64px;
  color: #ffffff;
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8 55%, #2563eb);
}

/* The same column for the hero, the cards and the footer, with a 16px gutter on phones */
.hero-inner,
.content,
.footer {
  max-width: 952px;
  margin: 0 auto;
  padding-inline: 16px;
}

h1 {
  margin: 0 0 4px;
  font-size: clamp(1.9rem, 6vw, 2.6rem);
  letter-spacing: -0.02em;
}

.tagline {
  margin-bottom: 22px;
  font-size: 1.05rem;
  color: #dbe7ff;
}

/* The cards start on top of the hero's lower edge */
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: -36px;
}

.status {
  font-size: 1.05rem;
}

.error {
  border-left: 5px solid #c2410c;
}

.tip {
  color: var(--muted);
  font-size: 0.95rem;
}

.place {
  margin: 0;
  padding-block: 16px;
  font-size: 1.6rem;
}

.footer {
  padding-block: 28px 36px;
  font-size: 0.85rem;
  color: var(--muted);
}
</style>
