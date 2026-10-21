<script setup>
import { computed, ref, watch } from 'vue'
import { getJson } from '../api.js'
import { formatDate } from '../format.js'

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
  <section>
    <h3>Best Time Outside</h3>
    <p>
      Pick an activity to see the best times for it during your trip.
      Each 3-hour slot gets a score from 0 to 100 from the weather forecast and the hourly air pollution forecast.
    </p>

    <p v-if="loading">Finding the best times...</p>
    <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <template v-else-if="activity">
      <div role="group" aria-label="Activity">
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
      <p v-if="bestSlots[0].score < POOR_SCORE_BELOW">
        No time in the next 3 days scores {{ POOR_SCORE_BELOW }} or more, so these are the least bad.
      </p>
      <ol>
        <li v-for="slot in bestSlots" :key="slot.dt">
          <strong>{{ formatDate(slot.date) }}, {{ slot.time }}</strong>
          scores {{ slot.score }}: {{ explain(slot) }}
        </li>
      </ol>

      <table>
        <caption>Score for every 3-hour slot, in local time</caption>
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
    </template>
  </section>
</template>
