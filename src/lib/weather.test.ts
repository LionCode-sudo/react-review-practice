import { describe, expect, it } from 'vitest'
import { formatForecastDay, formatTemperature, getWeatherPresentation } from './weather'

describe('getWeatherPresentation', () => {
  it.each([
    [0, 'Clear sky', 'clear'],
    [2, 'Partly cloudy', 'partly-cloudy'],
    [45, 'Foggy', 'fog'],
    [53, 'Drizzle', 'drizzle'],
    [63, 'Rain showers', 'rain'],
    [73, 'Snow', 'snow'],
    [95, 'Thunderstorms', 'storm'],
    [999, 'Cloudy', 'cloudy'],
  ] as const)('maps weather code %i to %s', (code, label, kind) => {
    expect(getWeatherPresentation(code)).toEqual({ label, kind })
  })
})

describe('formatTemperature', () => {
  it('rounds Celsius values and adds the degree symbol', () => {
    expect(formatTemperature(24.6, 'celsius')).toBe('25°')
  })

  it('converts Celsius values to Fahrenheit before rounding', () => {
    expect(formatTemperature(24.6, 'fahrenheit')).toBe('76°')
  })
})

describe('formatForecastDay', () => {
  it('formats an ISO date as a weekday without shifting time zones', () => {
    expect(formatForecastDay('2026-10-12')).toBe('Mon')
  })
})
