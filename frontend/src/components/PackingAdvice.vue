<script setup>
import { computed } from 'vue'
import { COLD_BELOW, HOT_ABOVE, needsUmbrella, packingAdvice } from '../packing.js'

const props = defineProps({
  days: { type: Array, required: true },
})

const umbrella = computed(() => needsUmbrella(props.days))
const advice = computed(() => packingAdvice(props.days))
</script>

<template>
  <section class="card">
    <h3>What to pack</h3>
    <div class="tiles">
      <p v-if="umbrella" class="tile wet">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3C6.5 3 2.5 7 2 12h20c-.5-5-4.5-9-10-9z" fill="currentColor" />
          <path d="M12 12v6.5a2 2 0 0 1-4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>Bring an umbrella: rain is forecast in the next 3 days.</span>
      </p>
      <p v-else class="tile dry">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"
          />
        </svg>
        <span>No rain is forecast for the next 3 days, so you can leave the umbrella at home.</span>
      </p>
      <div class="tile clothes">
        <p>
          Pack for <span :class="['category', advice.main.toLowerCase()]">{{ advice.main }}</span> weather,
          with an average of {{ advice.average.toFixed(1) }}&nbsp;°C.
        </p>
        <p v-if="advice.alsoPack.length">
          Some forecast times fall outside that range, so also pack for
          <span v-for="category in advice.alsoPack" :key="category" :class="['category', category.toLowerCase()]">{{ category }}</span>
        </p>
      </div>
    </div>
    <p class="rule">
      Cold is below {{ COLD_BELOW }}&nbsp;°C, Mild is {{ COLD_BELOW }}&nbsp;°C to {{ HOT_ABOVE }}&nbsp;°C,
      Hot is above {{ HOT_ABOVE }}&nbsp;°C.
    </p>
  </section>
</template>

<style scoped>
.tiles {
  display: grid;
  gap: 12px;
}

@media (min-width: 640px) {
  .tiles {
    grid-template-columns: 1fr 1fr;
  }
}

.tile {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
}

.wet,
.dry {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 600;
}

.wet {
  color: #1e3a8a;
  background: #e3edff;
}

.dry {
  color: #854d0e;
  background: #fef6dc;
}

.icon {
  flex: none;
  width: 30px;
  height: 30px;
}

.clothes {
  background: #f6f8fb;
}

.category {
  display: inline-block;
  margin: 0 2px;
  padding: 1px 10px;
  font-weight: 700;
  border-radius: 999px;
}

.cold {
  color: #1e3a8a;
  background: #dbeafe;
}

.mild {
  color: #166534;
  background: #dcfce7;
}

.hot {
  color: #9a3412;
  background: #ffedd5;
}

.rule {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--muted);
}
</style>
