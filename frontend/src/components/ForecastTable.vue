<script setup>
import { computed } from 'vue'
import { summariseDay } from '../packing.js'
import { formatDate, formatRain, formatTemp, formatWind } from '../format.js'

const props = defineProps({
  days: { type: Array, required: true },
})

const rows = computed(() => props.days.map(summariseDay))
</script>

<template>
  <section>
    <h3>Next 3 days</h3>
    <table>
      <thead>
        <tr>
          <th scope="col">Day</th>
          <th scope="col">Temperature</th>
          <th scope="col">Strongest wind</th>
          <th scope="col">Rain</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.date">
          <th scope="row">{{ formatDate(row.date) }}</th>
          <td>{{ formatTemp(row.minTemp) }} to {{ formatTemp(row.maxTemp) }}</td>
          <td>{{ formatWind(row.maxWind) }}</td>
          <td>{{ formatRain(row.totalRainMm) }}, {{ row.rainLevel }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
