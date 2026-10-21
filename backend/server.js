import express from 'express';
import { findCity, getAirPollution, getAirPollutionForecast, getForecast, UpstreamError } from './openWeather.js';
import { selectNextThreeDays } from './forecast.js';
import { describeAirQuality } from './airQuality.js';
import { planBestTimes } from './bestTimes.js';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: `ok` });
});

app.get('/api/weather', async (req, res) => {
  let city = req.query.city;

  if (typeof city !== 'string') {
    return res.status(400).json({ error: 'Please enter a valid city name'});
  }

  city = city.trim();

  if (!city) {
    return res.status(400).json({ error: 'Please enter a city name'});
  }

  const place = await findCity(city);

  if (!place) {
    return res.status(404).json({ error: 'City not found.' });
  }

  // Both requests only need the coordinates, so they run in parallel.
  // allSettled instead of all: if only the air pollution request fails, the user still gets the forecast.
  const [forecastResult, airPollutionResult] = await Promise.allSettled([
    getForecast(place.lat, place.lon),
    getAirPollution(place.lat, place.lon)
  ]);

  if (forecastResult.status === 'rejected') {
    throw forecastResult.reason;
  }
  const forecast = forecastResult.value;

  let airQuality = null;
  if (airPollutionResult.status === 'fulfilled') {
    airQuality = describeAirQuality(airPollutionResult.value);
  } else {
    console.error(airPollutionResult.reason.message);
  }

  return res.json({
    location: {
      name: place.name,
      country: place.country,
      state: place.state?? null,
      lat: place.lat,
      lon: place.lon,
      timezoneOffset: forecast.city.timezone
    },
    days: selectNextThreeDays(forecast),
    airQuality
  });
  
});

// A latitude or longitude from the query string, or null if it is missing or out of range.
// Number('') is 0, so an empty parameter is rejected before converting it.
function parseCoordinate(text, limit) {
  if (typeof text !== 'string' || text.trim() === '') {
    return null;
  }
  const value = Number(text);
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

// Takes coordinates instead of a city name, so it always plans for the place /api/weather already found
app.get('/api/best-times', async (req, res) => {
  const lat = parseCoordinate(req.query.lat, 90);
  const lon = parseCoordinate(req.query.lon, 180);

  if (lat === null || lon === null) {
    return res.status(400).json({ error: 'Please give a latitude from -90 to 90 and a longitude from -180 to 180.' });
  }

  // Both datasets feed every score, so if either request fails the plan fails (502)
  const [forecast, pollutionForecast] = await Promise.all([
    getForecast(lat, lon),
    getAirPollutionForecast(lat, lon)
  ]);

  return res.json(planBestTimes(forecast, pollutionForecast));
});

app.use((err, req, res, next) => {
  console.error(err.message);

  if (err instanceof UpstreamError) {
    return res.status(502).json({ 
      error: 'Weather service is currently unavailable. Please try again later.' 
    });
  }

  return res.status(500).json({ 
    error: 'An internal server error occurred.' 
  });
});

app.listen(process.env.PORT ?? 3000, () => {
  console.log(`Listening on http://localhost:${process.env.PORT?? 3000}`);
});
