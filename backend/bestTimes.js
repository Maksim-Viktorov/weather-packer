// Best Time Outside: scores every 3-hour slot of the next 3 days for four activities,
// combining the weather forecast with the hourly air pollution forecast.
import { selectNextThreeDays } from './forecast.js';
import { LEVEL_NAMES } from './airQuality.js';

// Activity profiles: ideal "feels like" range in °C, wind in m/s, rain in mm per 3-hour slot
export const ACTIVITIES = [
    { id: 'run', label: 'Running', idealFeelsLike: [8, 18], maxWind: 8, maxRainMm: 0.5, airSensitivity: 1.5, darkPenalty: 25 },
    { id: 'cycle', label: 'Cycling', idealFeelsLike: [12, 22], maxWind: 6, maxRainMm: 0.2, airSensitivity: 1.2, darkPenalty: 40 },
    { id: 'sightseeing', label: 'Sightseeing', idealFeelsLike: [14, 26], maxWind: 10, maxRainMm: 1, airSensitivity: 0.8, darkPenalty: 60 },
    { id: 'picnic', label: 'Picnic', idealFeelsLike: [18, 28], maxWind: 5, maxRainMm: 0, airSensitivity: 1.0, darkPenalty: 80 }
];

// Penalties, subtracted from a starting score of 100
const POINTS_PER_DEGREE = 4;     // per °C outside the ideal range
const POINTS_PER_WIND_MS = 8;    // per m/s above the activity's maximum
const RAIN_PENALTY = 30;         // once the rain is above the activity's tolerance...
const POINTS_PER_RAIN_MM = 10;   // ...plus this per mm of rain
const POINTS_PER_AQI_STEP = 10;  // per step above Good, times the activity's air sensitivity

// A weather slot at time dt stands for the 3 hours around it: 90 minutes either side
const HALF_SLOT_SECONDS = 90 * 60;
const MS_TO_KMH = 3.6;

// The worst (highest) air quality index among the pollution hours with start <= dt < end
export function worstAqiBetween(hours, start, end) {
    const inWindow = hours.filter((hour) => hour.dt >= start && hour.dt < end);
    if (inWindow.length === 0) {
        return null;
    }
    return Math.max(...inWindow.map((hour) => hour.main.aqi));
}

export function scoreSlot(slot, aqi, activity) {
    let score = 100;
    const reasons = [];
    const [low, high] = activity.idealFeelsLike;

    if (slot.feelsLike < low) {
        score -= (low - slot.feelsLike) * POINTS_PER_DEGREE;
        reasons.push(`Feels cold (${Math.round(slot.feelsLike)} °C)`);
    } else if (slot.feelsLike > high) {
        score -= (slot.feelsLike - high) * POINTS_PER_DEGREE;
        reasons.push(`Feels hot (${Math.round(slot.feelsLike)} °C)`);
    }

    if (slot.windSpeed > activity.maxWind) {
        score -= (slot.windSpeed - activity.maxWind) * POINTS_PER_WIND_MS;
        reasons.push(`Windy (${Math.round(slot.windSpeed * MS_TO_KMH)} km/h)`);
    }

    if (slot.rainMm > activity.maxRainMm) {
        score -= RAIN_PENALTY + slot.rainMm * POINTS_PER_RAIN_MM;
        reasons.push(`Rain (${slot.rainMm} mm)`);
    }

    // Beyond the 96-hour pollution forecast there is no data: say so, but do not penalise
    if (aqi === null) {
        reasons.push('Air quality unknown');
    } else if (aqi > 1) {
        score -= (aqi - 1) * POINTS_PER_AQI_STEP * activity.airSensitivity;
        reasons.push(`Air ${LEVEL_NAMES[aqi - 1]}`);
    }

    if (!slot.isDaytime) {
        score -= activity.darkPenalty;
        reasons.push('Dark');
    }

    return { score: Math.max(0, Math.round(score)), reasons };
}

// All activities in one response, so switching activity in the browser needs no new request
export function planBestTimes(forecast, pollutionForecast, now = Date.now()) {
    // The same 3 days as the rest of the app, as one list of slots that remember their date
    const slots = selectNextThreeDays(forecast, now).flatMap((day) =>
        day.slots.map((slot) => ({ ...slot, date: day.date }))
    );
    const hours = pollutionForecast.list ?? [];
    const slotsWithAqi = slots.map((slot) => ({
        slot,
        aqi: worstAqiBetween(hours, slot.dt - HALF_SLOT_SECONDS, slot.dt + HALF_SLOT_SECONDS)
    }));

    return {
        activities: ACTIVITIES.map((activity) => ({
            id: activity.id,
            label: activity.label,
            slots: slotsWithAqi.map(({ slot, aqi }) => ({
                dt: slot.dt,
                date: slot.date,
                time: slot.time,
                feelsLike: slot.feelsLike,
                windSpeed: slot.windSpeed,
                rainMm: slot.rainMm,
                description: slot.description,
                icon: slot.icon,
                aqi,
                ...scoreSlot(slot, aqi, activity)
            }))
        }))
    };
}
