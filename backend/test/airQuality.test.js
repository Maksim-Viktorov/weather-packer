import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeAirQuality, gradePollutant } from '../airQuality.js';

// A real reading for Dublin on 21 October 2026: ozone just above the Good limit
const dublinResponse = {
  list: [{
    main: { aqi: 2 },
    components: { co: 135.16, no: 0, no2: 1.35, o3: 72.97, so2: 0.36, pm2_5: 0.57, pm10: 0.79, nh3: 0.81 },
  }],
};

test('PM2.5 band edges follow the half-open intervals', () => {
  assert.equal(gradePollutant('pm2_5', 9.99).levelName, 'Good');
  assert.equal(gradePollutant('pm2_5', 10).levelName, 'Fair');
  assert.equal(gradePollutant('pm2_5', 74.9).levelName, 'Poor');
  assert.equal(gradePollutant('pm2_5', 75).levelName, 'Very Poor');
});

test('measures how elevated a value is against the Good limit', () => {
  const pm25 = gradePollutant('pm2_5', 32);
  assert.equal(pm25.level, 3);
  assert.equal(pm25.goodLimit, 10);
  assert.equal(pm25.timesGoodLimit, 3.2);
});

test('gives health text only above Good', () => {
  assert.equal(gradePollutant('o3', 59.9).healthRisk, null);
  const fair = gradePollutant('o3', 60);
  assert.equal(typeof fair.healthRisk, 'string');
  assert.ok(fair.healthRisk.length > 0);
  assert.ok(fair.advice.length > 0);
});

test('grades the six pollutants with bands, and the worst band matches the index', () => {
  const airQuality = describeAirQuality(dublinResponse);
  assert.deepEqual(airQuality.pollutants.map((pollutant) => pollutant.code), ['so2', 'no2', 'pm10', 'pm2_5', 'o3', 'co']);
  assert.equal(airQuality.overallIndex, 2);
  assert.equal(airQuality.overallLevelName, 'Fair');
  assert.equal(Math.max(...airQuality.pollutants.map((pollutant) => pollutant.level)), airQuality.overallIndex);
});

test('skips a missing pollutant instead of grading it Very Poor', () => {
  const { pm10, ...withoutPm10 } = dublinResponse.list[0].components;
  const airQuality = describeAirQuality({ list: [{ ...dublinResponse.list[0], components: withoutPm10 }] });
  assert.equal(airQuality.pollutants.length, 5);
  assert.ok(airQuality.pollutants.every((pollutant) => pollutant.code !== 'pm10'));
  assert.equal(describeAirQuality({ list: [] }), null);
});
