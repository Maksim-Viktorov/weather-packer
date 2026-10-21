<script setup>
import { computed } from 'vue'
import { summariseDay } from '../packing.js'
import { formatDate, formatRain, formatTemp, formatWind, iconUrl } from '../format.js'

const props = defineProps({
  days: { type: Array, required: true },
})

const rows = computed(() => props.days.map(summariseDay))
</script>

<template>
  <section class="card">
    <h3>Next 3 days</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Temperature</th>
            <th scope="col">Max wind</th>
            <th scope="col">Rain</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.date">
            <th scope="row">
              <div class="day">
                <img class="weather-icon" :src="iconUrl(row.icon)" alt="" width="40" height="40" />
                <span class="date">{{ formatDate(row.date) }}</span>
                <span class="sky">{{ row.description }}</span>
              </div>
            </th>
            <td>{{ formatTemp(row.minTemp) }} to {{ formatTemp(row.maxTemp) }}</td>
            <td>{{ formatWind(row.maxWind) }}</td>
            <td>{{ formatRain(row.totalRainMm) }}, {{ row.rainLevel }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

tbody tr:last-child > * {
  border-bottom: 0;
}

thead th {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
}

td {
  font-variant-numeric: tabular-nums;
}

.day {
  display: grid;
  grid-template-columns: 40px auto;
  column-gap: 8px;
  align-items: center;
}

.day img {
  grid-row: span 2;
}

.date {
  font-weight: 700;
}

.sky {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--muted);
}

/* On phones, fixed column widths make long values wrap inside their column instead of widening the table */
@media (max-width: 520px) {
  table {
    table-layout: fixed;
  }

  thead th:nth-child(1) {
    width: 30%;
  }

  thead th:nth-child(2) {
    width: 25%;
  }

  thead th:nth-child(3) {
    width: 19%;
  }

  th,
  td {
    padding: 8px 3px;
    font-size: 0.8rem;
  }

  thead th {
    font-size: 0.6rem;
    letter-spacing: 0;
  }

  .day {
    grid-template-columns: auto;
  }

  .day img {
    grid-row: auto;
    width: 32px;
    height: 32px;
  }
}
</style>
