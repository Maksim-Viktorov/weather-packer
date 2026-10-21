# Weather Packer

CSU44000 Internet Applications, Assignment 1.
A Vue client and an Express server that turn the OpenWeatherMap forecast for a city into packing advice, a 3-day table, air pollution warnings and the best times to be outside.

## Running it

You need Node.js 20.6 or later (developed on Node 24).

1. Run `npm install` in `backend/` and in `frontend/`.
2. Copy `backend/.env.example` to `backend/.env` and put an OpenWeatherMap API key in it (free at https://openweathermap.org).
3. Run `npm run dev` in `backend/` and in `frontend/`, in two terminals.
4. Open http://localhost:5173.

## Tests

Run `npm test` in `backend/` and in `frontend/`.
