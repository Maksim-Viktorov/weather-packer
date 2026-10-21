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
  <section>
    <h3>What to pack</h3>
    <p v-if="umbrella">Bring an umbrella: rain is forecast in the next 3 days.</p>
    <p v-else>No rain is forecast for the next 3 days, so you can leave the umbrella at home.</p>
    <p>
      Pack for <span :class="['category', advice.main.toLowerCase()]">{{ advice.main }}</span> weather,
      with an average of {{ advice.average.toFixed(1) }} °C.
    </p>
    <p v-if="advice.alsoPack.length">
      Some forecast times fall outside that range, so also pack for
      <span v-for="category in advice.alsoPack" :key="category" :class="['category', category.toLowerCase()]">{{ category }}</span>
    </p>
    <p>Cold is below {{ COLD_BELOW }} °C, Mild is {{ COLD_BELOW }} °C to {{ HOT_ABOVE }} °C, Hot is above {{ HOT_ABOVE }} °C.</p>
  </section>
</template>
