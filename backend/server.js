import express from 'express';
import { findCity, getAirPollution, getForecast, UpstreamError } from './openWeather.js';
import { selectNextThreeDays } from './forecast.js';
import { describeAirQuality } from './airQuality.js';

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
