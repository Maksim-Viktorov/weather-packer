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

