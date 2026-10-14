const BASE_URL = 'https://api.openweathermap.org';

export class UpstreamError extends Error {}

async function fetchJson(path, params = {}) {
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey) {
        throw new UpstreamError('Missing OPEN_WEATHER_API_KEY environment variable');
    }
    const url = new URL(path, BASE_URL);
    url.search = new URLSearchParams({
        ...params, 
        appid: apiKey
    })
    let res;
    try {
        res = await fetch(url);
    } catch(error) {
        throw new UpstreamError('Could not reach OpenWeatherMap', { cause: error });
    }
    if (!res.ok) {
        throw new UpstreamError(`Response is not ok (HTTP ${res.status})`, { status: res.status });
    }
    try {
        return await res.json();
    } catch (error) {
        throw new UpstreamError('Failed to parse JSON response from OpenWeatherMap', { cause: error });
    }
}

export async function findCity(name) {
    const data = await fetchJson('/geo/1.0/direct', { q: name, limit: 1});
    if (!data || data.length === 0) {
        return null;
    }
    const { name: cityName, country, state, lat, lon } = data[0];
    return { name: cityName, country, state, lat, lon };
}

export async function getForecast(lat, lon) {
    return await fetchJson('/data/2.5/forecast', {
        lat: String(lat),
        lon: String(lon),
        units: 'metric'
    });
}