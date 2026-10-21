<script setup>
import { computed, ref, watch } from 'vue'
import { getJson } from '../api.js'
import { formatDate, iconUrl } from '../format.js'

const props = defineProps({
  location: { type: Object, required: true },   // the place /api/weather found, with lat and lon
})

const BEST_SLOT_COUNT = 3
const POOR_SCORE_BELOW = 50

const plan = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const selectedId = ref('run')

async function fetchPlan() {
  loading.value = true
  errorMessage.value = ''
  plan.value = null
  try {
    const query = new URLSearchParams({ lat: props.location.lat, lon: props.location.lon })
    plan.value = await getJson(`/api/best-times?${query}`)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

// Fetching is a side effect, so it belongs in a watcher rather than a computed property.
// immediate: true also fetches once when the planner first appears.
watch(() => props.location, fetchPlan, { immediate: true })

// The server sends every activity at once, so switching activity only changes selectedId
const activity = computed(() => plan.value?.activities.find((option) => option.id === selectedId.value))

// toSorted, not sort: sort would reorder the reactive array that the timeline also shows
const bestSlots = computed(() =>
  activity.value?.slots.toSorted((a, b) => b.score - a.score).slice(0, BEST_SLOT_COUNT) ?? [],
)

// One timeline row per day
const timelineDays = computed(() => {
  const days = new Map()
  for (const slot of activity.value?.slots ?? []) {
    if (!days.has(slot.date)) days.set(slot.date, [])
    days.get(slot.date).push(slot)
  }
  return [...days].map(([date, slots]) => ({ date, slots }))
})

// One offset per response, so every day has its slots at the same local times
const slotTimes = computed(() => timelineDays.value[0]?.slots.map((slot) => slot.time) ?? [])

// Hue 0 is red and hue 120 is green, so a score of 0 is red, 50 yellow and 100 green
function scoreColour(score) {
  return `hsl(${score * 1.2}, 70%, 78%)`
}

function explain(slot) {
  return slot.reasons.length ? slot.reasons.join(', ') : 'Ideal conditions'
}
</script>

<template>
  <section class="card">
    <h3>Best Time Outside</h3>
    <p class="intro">
      Pick an activity to see the best times for it during your trip.
      Each 3-hour slot gets a score from 0 to 100 from the weather forecast and the hourly air pollution forecast.
    </p>

    <p v-if="loading" role="status"><span class="spinner" aria-hidden="true"></span>Finding the best times...</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <template v-else-if="activity">
      <div class="activities" role="group" aria-label="Activity">
        <button
          v-for="option in plan.activities"
          :key="option.id"
          type="button"
          :class="{ active: option.id === selectedId }"
          :aria-pressed="option.id === selectedId"
          @click="selectedId = option.id"
        >
          {{ option.label }}
        </button>
      </div>

      <h4>Best times for {{ activity.label }}</h4>
      <p v-if="bestSlots[0].score < POOR_SCORE_BELOW" class="poor">
        No time in the next 3 days scores {{ POOR_SCORE_BELOW }} or more, so these are the least bad.
      </p>
      <ol class="best">
        <li v-for="slot in bestSlots" :key="slot.dt">
          <span class="score" :style="{ backgroundColor: scoreColour(slot.score) }">
            <span class="visually-hidden">Score </span>{{ slot.score }}
          </span>
          <img class="weather-icon" :src="iconUrl(slot.icon)" :alt="slot.description" width="40" height="40" />
          <span class="when">
            <strong>{{ formatDate(slot.date) }}, {{ slot.time }}</strong>
            <span class="why">{{ explain(slot) }}</span>
          </span>
        </li>
      </ol>

      <h4>All slots</h4>
      <div class="timeline-wrap">
        <table class="timeline">
          <caption>Score for every 3-hour slot, in local time. Hover over a slot to see why it lost points.</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th v-for="time in slotTimes" :key="time" scope="col">{{ time }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in timelineDays" :key="day.date">
              <th scope="row">{{ formatDate(day.date) }}</th>
              <td
                v-for="slot in day.slots"
                :key="slot.dt"
                :style="{ backgroundColor: scoreColour(slot.score) }"
                :title="`${slot.time}: ${explain(slot)}`"
              >
                {{ slot.score }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="legend" aria-hidden="true">
        <span>0 poor</span>
        <span class="scale"></span>
        <span>100 ideal</span>
      </div>
    </template>
  </section>
</template>

<style scoped>
.intro {
  color: var(--muted);
}

.error {
  color: #9a3412;
}

.activities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 4px;
}

.activities button {
  padding: 8px 18px;
  font-weight: 600;
  color: var(--accent);
  background: #ffffff;
  border: 2px solid var(--accent);
  border-radius: 999px;
}

.activities button:hover {
  background: var(--accent-soft);
}

.activities button.active {
  color: #ffffff;
  background: var(--accent);
}

.poor {
  padding: 10px 14px;
  color: #9a3412;
  background: #fff4ea;
  border-radius: 10px;
}

.best {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.best li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: #f6f8fb;
  border-radius: 10px;
}

.score {
  flex: none;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ink);
  border-radius: 50%;
}

.best img {
  flex: none;
}

.when {
  display: flex;
  flex-direction: column;
}

.why {
  font-size: 0.9rem;
  color: var(--muted);
}

.timeline-wrap {
  overflow-x: auto;
}

.timeline {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 3px;
}

.timeline caption {
  caption-side: bottom;
  padding-top: 6px;
  font-size: 0.8rem;
  text-align: left;
  color: var(--muted);
}

.timeline th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}

.timeline thead th:first-child {
  width: 88px;
  text-align: left;
}

.timeline tbody th {
  text-align: left;
  font-size: 0.8rem;
  color: var(--ink);
}

.timeline td {
  padding: 9px 0;
  font-size: 0.9rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
  border-radius: 6px;
}

.legend {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--muted);
}

.scale {
  width: 140px;
  height: 10px;
  background: linear-gradient(to right, hsl(0, 70%, 78%), hsl(60, 70%, 78%), hsl(120, 70%, 78%));
  border-radius: 999px;
}

@media (max-width: 520px) {
  .timeline {
    border-spacing: 2px;
  }

  .timeline thead th:first-child {
    width: 46px;
  }

  .timeline th {
    font-size: 0.62rem;
  }

  .timeline td {
    padding: 7px 0;
    font-size: 0.75rem;
  }
}
</style>
