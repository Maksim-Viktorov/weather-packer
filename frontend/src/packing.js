// Packing rules from the brief, kept as pure functions so node --test can check them without a browser

// The brief: Cold below 8 °C, Mild from 8 °C to 24 °C inclusive, Hot above 24 °C
export const COLD_BELOW = 8
export const HOT_ABOVE = 24
const TEMPERATURE_CATEGORIES = ['Cold', 'Mild', 'Hot']

// Rain-rate classes in mm per hour, from the "Intensity" section of Wikipedia's "Rain" article
const LIGHT_RAIN_BELOW = 2.5
const HEAVY_RAIN_ABOVE = 7.6
const HOURS_PER_SLOT = 3   // each forecast slot holds the rain of 3 hours

export function classifyTemperature(celsius) {
  if (celsius < COLD_BELOW) return 'Cold'
  if (celsius <= HOT_ABOVE) return 'Mild'
  return 'Hot'
}

export function rainLevel(mmPerHour) {
  if (mmPerHour <= 0) return 'None'
  if (mmPerHour < LIGHT_RAIN_BELOW) return 'Light'
  if (mmPerHour <= HEAVY_RAIN_ABOVE) return 'Moderate'
  return 'Heavy'
}

// One table row; a day's rain level is the level of its heaviest slot
export function summariseDay(day) {
  const temps = day.slots.map((slot) => slot.temp)
  const heaviestRainMm = Math.max(...day.slots.map((slot) => slot.rainMm))
  return {
    date: day.date,
    minTemp: Math.min(...temps),
    maxTemp: Math.max(...temps),
    maxWind: Math.max(...day.slots.map((slot) => slot.windSpeed)),
    totalRainMm: day.slots.reduce((total, slot) => total + slot.rainMm, 0),
    rainLevel: rainLevel(heaviestRainMm / HOURS_PER_SLOT),
  }
}

export function needsUmbrella(days) {
  return days.some((day) => day.slots.some((slot) => slot.rainMm > 0))
}

// The main label comes from the average of all slots. alsoPack lists the other
// categories that at least one slot falls into, such as cold nights on a mild trip.
export function packingAdvice(days) {
  const temps = days.flatMap((day) => day.slots.map((slot) => slot.temp))
  const average = temps.reduce((total, temp) => total + temp, 0) / temps.length
  const main = classifyTemperature(average)
  const seen = new Set(temps.map(classifyTemperature))
  const alsoPack = TEMPERATURE_CATEGORIES.filter((category) => category !== main && seen.has(category))
  return { main, average, alsoPack }
}
