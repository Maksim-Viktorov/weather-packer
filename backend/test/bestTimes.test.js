import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ACTIVITIES, planBestTimes, scoreSlot, worstAqiBetween } from '../bestTimes.js';

const running = ACTIVITIES.find((activity) => activity.id === 'run');
const sightseeing = ACTIVITIES.find((activity) => activity.id === 'sightseeing');
const perfectSlot = { feelsLike: 12, windSpeed: 2, rainMm: 0, isDaytime: true };

test('a perfect daytime slot scores 100 with no reasons', () => {
  assert.deepEqual(scoreSlot(perfectSlot, 1, running), { score: 100, reasons: [] });
});

test('rain above the tolerance costs at least 30 points', () => {
  const { score, reasons } = scoreSlot({ ...perfectSlot, rainMm: 1.2 }, 1, running);
  assert.equal(score, 100 - 30 - 12);
  assert.deepEqual(reasons, ['Rain (1.2 mm)']);
});

test('a night slot is marked Dark', () => {
  const { score, reasons } = scoreSlot({ ...perfectSlot, isDaytime: false }, 1, running);
  assert.equal(score, 100 - running.darkPenalty);
  assert.deepEqual(reasons, ['Dark']);
});

test('unknown air quality costs nothing but is explained', () => {
  assert.deepEqual(scoreSlot(perfectSlot, null, running), { score: 100, reasons: ['Air quality unknown'] });
});

test('the worked example: Dublin, 11 October, 10:00, running scores 85', () => {
  const slot = { feelsLike: 8.6, windSpeed: 1.46, rainMm: 0, isDaytime: true };
  assert.deepEqual(scoreSlot(slot, 2, running), { score: 85, reasons: ['Air Fair'] });
});

test('bad air costs running more than sightseeing', () => {
  const slot = { feelsLike: 16, windSpeed: 2, rainMm: 0, isDaytime: true };   // ideal for both
  assert.equal(scoreSlot(slot, 5, running).score, 40);       // 100 - 4 x 10 x 1.5
  assert.equal(scoreSlot(slot, 5, sightseeing).score, 68);   // 100 - 4 x 10 x 0.8
});

test('worstAqiBetween takes the worst hour inside the window only', () => {
  const hours = [
    { dt: 0, main: { aqi: 5 } },       // before the window
    { dt: 3600, main: { aqi: 2 } },
    { dt: 7200, main: { aqi: 3 } },
    { dt: 10800, main: { aqi: 1 } },
    { dt: 14400, main: { aqi: 5 } },   // exactly at the end, which is excluded
  ];
  assert.equal(worstAqiBetween(hours, 1800, 14400), 3);
  assert.equal(worstAqiBetween(hours, 20000, 30000), null);
});

test('plans 24 slots for each activity, with unknown air beyond the pollution forecast', async () => {
  const forecast = JSON.parse(await readFile(new URL('./fixtures/forecast-dublin.json', import.meta.url), 'utf8'));
  const now = forecast.list[0].dt * 1000;
  // a made-up pollution forecast covering only the first 48 hours, all Fair
  const start = forecast.list[0].dt;
  const pollution = { list: Array.from({ length: 48 }, (_, i) => ({ dt: start + i * 3600, main: { aqi: 2 } })) };

  const plan = planBestTimes(forecast, pollution, now);
  assert.deepEqual(plan.activities.map((activity) => activity.slots.length), [24, 24, 24, 24]);

  const slots = plan.activities[0].slots;
  assert.equal(slots[0].aqi, 2);
  assert.equal(slots.at(-1).aqi, null);
  assert.ok(slots.at(-1).reasons.includes('Air quality unknown'));
});
