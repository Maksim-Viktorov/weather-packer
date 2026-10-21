<script setup>
import { ref } from 'vue'

defineProps({
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['search'])

const city = ref('')   // reactive variable: when it changes, the page updates

function submit() {
  const trimmed = city.value.trim()
  if (trimmed) emit('search', trimmed)
}
</script>

<template>
  <form class="search" @submit.prevent="submit">
    <label for="city">Where are you going?</label>
    <div class="row">
      <input id="city" v-model="city" placeholder="A city, like Paris or Dublin, US" autocomplete="off" autofocus />
      <button type="submit" :disabled="loading || !city.trim()">Search</button>
    </div>
  </form>
</template>

<style scoped>
.search {
  max-width: 600px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

input {
  flex: 1 1 160px;
  min-width: 0;
  padding: 12px 14px;
  font: inherit;
  font-size: 1rem;
  color: var(--ink);
  background: #ffffff;
  border: 0;
  border-radius: 10px;
  box-shadow: inset 0 1px 2px rgba(16, 24, 40, 0.12);
}

input::placeholder {
  color: #6b7280;
}

button {
  padding: 12px 24px;
  font-weight: 700;
  color: var(--ink);
  background: #fbbf24;
  border: 0;
  border-radius: 10px;
}

button:not(:disabled):hover {
  background: #fcd34d;
}
</style>
