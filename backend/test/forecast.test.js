import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { selectNextThreeDays } from '../forecast.js';

const fixtureUrl = new URL('./fixtures/forecast-dublin.json', import.meta.url);
const forecast = JSON.parse(await readFile(fixtureUrl, 'utf8'));
const now = forecast.list[0].dt * 1000;   // pretend "now" is the time of the first slot

test('returns three days of eight slots', () => {
  const days = selectNextThreeDays(forecast, now);
  assert.equal(days.length, 3);
  assert.deepEqual(days.map((day) => day.slots.length), [8, 8, 8]);
});

test('splits days at the destination midnight', () => {
  // UTC+5:30: local midnight is 18:30 UTC, so the first slot of a day is 21:00 UTC, which is 02:30 local
  const delhiForecast = { ...forecast, city: { ...forecast.city, timezone: 19800 } };
  const days = selectNextThreeDays(delhiForecast, now);
  assert.equal(days.length, 3);
  assert.deepEqual(days.map((day) => day.slots.length), [8, 8, 8]);
  assert.equal(days[0].slots[0].time, '02:30');
});

test('turns missing rain into 0 mm', () => {
  const slots = selectNextThreeDays(forecast, now).flatMap((day) => day.slots);
  assert.ok(slots.every((slot) => typeof slot.rainMm === 'number'));
  // the fixture has dry slots (no rain field) and wet ones, so both cases are covered
  assert.ok(slots.some((slot) => slot.rainMm === 0));
  assert.ok(slots.some((slot) => slot.rainMm > 0));
});

