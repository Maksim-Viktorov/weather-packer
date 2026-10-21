// Display helpers shared by the components. Values stay unrounded until they reach the page.

const MS_TO_KMH = 3.6

// The date is already the destination's local date. Formatting it in UTC stops the
// browser from shifting it into its own time zone (a day early for anyone west of UTC).
export function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-IE', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })
}

export function formatTemp(celsius) {
  return `${Math.round(celsius)} °C`
}

export function formatWind(metresPerSecond) {
  return `${Math.round(metresPerSecond * MS_TO_KMH)} km/h`
}

export function formatRain(mm) {
  return `${mm.toFixed(1)} mm`
}
