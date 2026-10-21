// Display helpers shared by the components. Values stay unrounded until they reach the page.

const MS_TO_KMH = 3.6
const NBSP = ' '   // a non-breaking space keeps a number and its unit on one line

// The date is already the destination's local date. Formatting it in UTC stops the
// browser from shifting it into its own time zone (a day early for anyone west of UTC).
export function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-IE', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })
}

export function formatTemp(celsius) {
  return `${Math.round(celsius)}${NBSP}°C`
}

export function formatWind(metresPerSecond) {
  return `${Math.round(metresPerSecond * MS_TO_KMH)}${NBSP}km/h`
}

export function formatRain(mm) {
  return `${mm.toFixed(1)}${NBSP}mm`
}

export function formatConcentration(microgramsPerCubicMetre) {
  return `${microgramsPerCubicMetre.toFixed(1)}${NBSP}µg/m³`
}

// OpenWeatherMap's own icon images, so the app needs no icon library
export function iconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}
