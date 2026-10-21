<script setup>
import { computed } from 'vue'
import { formatConcentration } from '../format.js'

const props = defineProps({
  airQuality: { type: Object, default: null },   // null when the server could not get air pollution data
})

// Pollutants above Good, each of which gets a warning
const elevated = computed(() => props.airQuality?.pollutants.filter((pollutant) => pollutant.level > 1) ?? [])
</script>

<template>
  <section>
    <h3>Air quality now</h3>
    <p v-if="!airQuality">Air quality data is unavailable right now. The forecast above is not affected.</p>
    <template v-else>
      <p>
        Overall: <span :class="`level-${airQuality.overallIndex}`">{{ airQuality.overallLevelName }}</span>
        ({{ airQuality.overallIndex }} on OpenWeatherMap's scale from 1 to 5)
      </p>
      <ul>
        <li v-for="pollutant in airQuality.pollutants" :key="pollutant.code" :class="`level-${pollutant.level}`">
          {{ pollutant.name }}: {{ formatConcentration(pollutant.value) }}, {{ pollutant.levelName }}
        </li>
      </ul>

      <div v-if="elevated.length">
        <h4>Pollution warnings</h4>
        <article v-for="pollutant in elevated" :key="pollutant.code" :class="`level-${pollutant.level}`">
          <h5>{{ pollutant.name }} is {{ pollutant.levelName }}</h5>
          <p>
            {{ formatConcentration(pollutant.value) }}, {{ pollutant.timesGoodLimit }} times
            the Good limit of {{ pollutant.goodLimit }} µg/m³.
          </p>
          <p>{{ pollutant.healthRisk }}</p>
          <p>{{ pollutant.advice }}</p>
        </article>
      </div>
      <p v-else>All pollutants are in the Good band.</p>
    </template>
  </section>
</template>
