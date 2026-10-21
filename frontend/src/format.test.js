import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, formatWind } from './format.js'

// Passes whatever time zone the computer running it is in (try TZ=America/Los_Angeles npm test)
test('dates keep the destination day', () => {
  assert.equal(formatDate('2026-10-22'), 'Thu, 22 Oct')
})

test('wind is shown in whole km/h', () => {
  assert.equal(formatWind(4.27), '15 km/h')
})
