import type { TemperatureUnit, WeatherPresentation } from '../types/weather'

export function getWeatherPresentation(code: number): WeatherPresentation {
  if (code === 0) return { label: 'Clear sky', kind: 'clear' }
  if (code === 1) return { label: 'Mainly clear', kind: 'clear' }
  if (code === 2) return { label: 'Partly cloudy', kind: 'partly-cloudy' }
  if (code === 3) return { label: 'Overcast', kind: 'cloudy' }
  if (code === 45 || code === 48) return { label: 'Foggy', kind: 'fog' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', kind: 'drizzle' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: 'Rain showers', kind: 'rain' }
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', kind: 'snow' }
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorms', kind: 'storm' }

  return { label: 'Cloudy', kind: 'cloudy' }
}

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  const temperature = unit === 'fahrenheit' ? (value * 9) / 5 + 32 : value
  return `${Math.round(temperature)}°`
}

export function formatForecastDay(date: string): string {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function formatHour(time: string): string {
  return new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(new Date(time))
}
