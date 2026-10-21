import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyTemperature, needsUmbrella, packingAdvice, rainLevel, summariseDay } from './packing.js'

test('umbrella only when some slot has rain', () => {
  const dry = [{ slots: [{ rainMm: 0 }, { rainMm: 0 }] }]
  const wet = [{ slots: [{ rainMm: 0 }] }, { slots: [{ rainMm: 0.2 }] }]
  assert.equal(needsUmbrella(dry), false)
  assert.equal(needsUmbrella(wet), true)
})

test('temperature boundaries follow the brief', () => {
  assert.equal(classifyTemperature(7.9), 'Cold')
  assert.equal(classifyTemperature(8), 'Mild')
  assert.equal(classifyTemperature(24), 'Mild')
  assert.equal(classifyTemperature(24.1), 'Hot')
})

test('packing label uses the average and lists each other category once', () => {
  // average 12 °C is Mild, with two cold slots and one hot one
  const mixed = [{ slots: [{ temp: 5 }, { temp: 12 }, { temp: 26 }, { temp: 5 }] }]
  assert.deepEqual(packingAdvice(mixed), { main: 'Mild', average: 12, alsoPack: ['Cold', 'Hot'] })

  const allMild = [{ slots: [{ temp: 10 }, { temp: 20 }] }]
  assert.deepEqual(packingAdvice(allMild).alsoPack, [])
})

test('rain levels use rate classes in mm per hour', () => {
  assert.equal(rainLevel(0), 'None')
  assert.equal(rainLevel(2.49), 'Light')
  assert.equal(rainLevel(2.5), 'Moderate')
  assert.equal(rainLevel(7.6), 'Moderate')
  assert.equal(rainLevel(7.7), 'Heavy')
})

test('a day summary takes its rain level from the heaviest slot', () => {
  const day = {
    date: '2026-10-22',
    slots: [
      { temp: 6, windSpeed: 3, rainMm: 0 },
      { temp: 11, windSpeed: 7.5, rainMm: 9 },   // 3 mm per hour: Moderate
      { temp: 9, windSpeed: 5, rainMm: 1.5 },
    ],
  }
  assert.deepEqual(summariseDay(day), {
    date: '2026-10-22', minTemp: 6, maxTemp: 11, maxWind: 7.5, totalRainMm: 10.5, rainLevel: 'Moderate',
  })
})
