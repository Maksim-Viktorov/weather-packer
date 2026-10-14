import express from 'express';
import { findCity, getForecast, UpstreamError } from './openWeather.js';
import { selectNextThreeDays } from './forecast.js';

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

  const forecast = await getForecast(place.lat, place.lon);

  return res.json({
    location: {
      name: place.name,
      country: place.country,
      state: place.state?? null,
      lat: place.lat,
      lon: place.lon,
      timezoneOffset: forecast.city.timezone
    },
    days: selectNextThreeDays(forecast)
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
