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
  <section class="card">
    <h3>Air quality now</h3>
    <p v-if="!airQuality">Air quality data is unavailable right now. The forecast above is not affected.</p>
    <template v-else>
      <p class="overall">
        Overall: <span :class="['badge', `level-${airQuality.overallIndex}`]">{{ airQuality.overallLevelName }}</span>
        ({{ airQuality.overallIndex }} on OpenWeatherMap's scale from 1 to 5)
      </p>
      <ul class="pollutants">
        <li v-for="pollutant in airQuality.pollutants" :key="pollutant.code" :class="`level-${pollutant.level}`">
          <span class="name">{{ pollutant.name }}</span>
          <span>{{ formatConcentration(pollutant.value) }}</span>
          <span class="band">{{ pollutant.levelName }}</span>
        </li>
      </ul>

      <div v-if="elevated.length" class="warnings">
        <h4>Pollution warnings</h4>
        <article v-for="pollutant in elevated" :key="pollutant.code" :class="['warning', `level-${pollutant.level}`]">
          <h5>{{ pollutant.name }} is {{ pollutant.levelName }}</h5>
          <p class="how-high">
            {{ formatConcentration(pollutant.value) }}, {{ pollutant.timesGoodLimit }} times
            the Good limit of {{ pollutant.goodLimit }}&nbsp;µg/m³.
          </p>
          <p>{{ pollutant.healthRisk }}</p>
          <p class="advice">{{ pollutant.advice }}</p>
        </article>
      </div>
      <p v-else class="all-good">All pollutants are in the Good band.</p>
    </template>
  </section>
</template>

<style scoped>
/* One colour pair per level, from green (Good) to purple (Very Poor); the band name is always shown as text too */
.level-1 {
  --level: #15803d;
  --level-bg: #ecfdf3;
}

.level-2 {
  --level: #a16207;
  --level-bg: #fefce8;
}

.level-3 {
  --level: #c2410c;
  --level-bg: #fff4ea;
}

.level-4 {
  --level: #b91c1c;
  --level-bg: #fef2f2;
}

.level-5 {
  --level: #7e22ce;
  --level-bg: #faf5ff;
}

.badge {
  display: inline-block;
  padding: 1px 10px;
  font-weight: 700;
  color: var(--level);
  background: var(--level-bg);
  border: 1px solid var(--level);
  border-radius: 999px;
}

.pollutants {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.pollutants li {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  background: var(--level-bg);
  border-left: 4px solid var(--level);
  border-radius: 8px;
}

.name {
  font-weight: 700;
}

.band {
  font-weight: 600;
  color: var(--level);
}

.warning {
  margin-top: 10px;
  padding: 14px 16px;
  background: var(--level-bg);
  border-left: 5px solid var(--level);
  border-radius: 10px;
}

h5 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: var(--level);
}

.how-high {
  font-weight: 600;
}

.advice {
  font-style: italic;
}

.all-good {
  margin-top: 14px;
  font-weight: 600;
  color: #15803d;
}
</style>
