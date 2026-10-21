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
  <form @submit.prevent="submit">
    <label for="city">Where are you going?</label>
    <input id="city" v-model="city" placeholder="A city, like Paris or Dublin, US" autocomplete="off" autofocus />
    <button type="submit" :disabled="loading || !city.trim()">Search</button>
  </form>
</template>
