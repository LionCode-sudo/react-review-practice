import { useCallback, useEffect, useRef, useState } from 'react'
import type { WeatherData, WeatherLocation } from '../types/weather'

type GeocodingResponse = {
  results?: WeatherLocation[]
}

type ForecastResponse = {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    is_day: number
    weather_code: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
    precipitation_probability: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
}

async function fetchJson<T>(url: URL, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error('The weather service is unavailable. Please try again.')
  }

  return (await response.json()) as T
}

async function requestWeather(query: string, signal: AbortSignal): Promise<WeatherData> {
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  geocodingUrl.search = new URLSearchParams({
    name: query,
    count: '1',
    language: 'en',
    format: 'json',
  }).toString()

  const geocoding = await fetchJson<GeocodingResponse>(geocodingUrl, signal)
  const location = geocoding.results?.[0]

  if (!location) {
    throw new Error(`We couldn't find "${query}". Try a nearby city.`)
  }

  return requestForecast(location, signal)
}

async function requestForecast(
  location: WeatherLocation,
  signal: AbortSignal,
): Promise<WeatherData> {
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    forecast_days: '5',
    timezone: 'auto',
  }).toString()

  const forecast = await fetchJson<ForecastResponse>(forecastUrl, signal)
  const forecastDays = forecast.daily.time.map((date, index) => ({
    date,
    weatherCode: forecast.daily.weather_code[index] ?? 3,
    high: forecast.daily.temperature_2m_max[index] ?? 0,
    low: forecast.daily.temperature_2m_min[index] ?? 0,
    precipitationChance: forecast.daily.precipitation_probability_max[index] ?? 0,
  }))

  const now = new Date()
  const hourly = forecast.hourly.time
    .map((time, index) => ({
      time,
      weatherCode: forecast.hourly.weather_code[index] ?? 3,
      temperature: forecast.hourly.temperature_2m[index] ?? 0,
      precipitationChance: forecast.hourly.precipitation_probability[index] ?? 0,
    }))
    .filter((hour) => new Date(hour.time) >= now)
    .slice(0, 24)

  return {
    location,
    current: {
      temperature: forecast.current.temperature_2m,
      feelsLike: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: forecast.current.wind_speed_10m,
      weatherCode: forecast.current.weather_code,
      isDay: forecast.current.is_day === 1,
    },
    forecast: forecastDays,
    hourly,
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while loading the forecast.'
}

const LOCATION_ERRORS: Record<number, string> = {
  1: 'Location access was denied. Allow it in your browser settings, or search for a city.',
  2: 'Your location is unavailable right now. Try again, or search for a city.',
  3: 'Finding your location took too long. Try again, or search for a city.',
}

const LOCATION_UNSUPPORTED =
  "Your browser can't share your location here. Search for a city instead."

type Coordinates = { latitude: number; longitude: number }

function getCurrentCoordinates(signal: AbortSignal): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error(LOCATION_UNSUPPORTED))
      return
    }

    // The browser can't cancel a position lookup, so stop waiting for it instead.
    const handleAbort = () => reject(new DOMException('Location request aborted', 'AbortError'))
    signal.addEventListener('abort', handleAbort, { once: true })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        signal.removeEventListener('abort', handleAbort)
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      },
      (positionError) => {
        signal.removeEventListener('abort', handleAbort)
        reject(new Error(LOCATION_ERRORS[positionError.code] ?? LOCATION_UNSUPPORTED))
      },
      { timeout: 10_000, maximumAge: 60_000 },
    )
  })
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  // Shared by every kind of lookup: cancels the previous request, tracks
  // loading and error state, and ignores results that were superseded.
  const runRequest = useCallback(
    async (
      load: (signal: AbortSignal) => Promise<WeatherData>,
      { keepWeather = false }: { keepWeather?: boolean } = {},
    ): Promise<WeatherData | null> => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller

      if (!keepWeather) {
        setWeather(null)
      }
      setError(null)
      setIsLoading(true)

      try {
        const result = await load(controller.signal)

        if (controller.signal.aborted) return null

        setWeather(result)
        return result
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(requestError))
        }
        return null
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [],
  )

  const search = useCallback(
    async (searchTerm: string): Promise<WeatherData | null> => {
      const query = searchTerm.trim()

      if (!query) {
        setError('Enter a city name to see its forecast.')
        return null
      }

      return runRequest((signal) => requestWeather(query, signal))
    },
    [runRequest],
  )

  // Keeps the current forecast on screen while the browser asks for permission,
  // so a denied or failed lookup doesn't leave the page empty.
  const searchByCurrentLocation = useCallback(
    () =>
      runRequest(
        async (signal) => {
          const { latitude, longitude } = await getCurrentCoordinates(signal)
          return requestForecast({ name: 'Your location', latitude, longitude }, signal)
        },
        { keepWeather: true },
      ),
    [runRequest],
  )

  useEffect(() => {
    const controller = new AbortController()
    activeRequest.current = controller

    async function loadInitialWeather() {
      try {
        setWeather(await requestWeather('Colombo', controller.signal))
      } catch (requestError) {
        if (controller.signal.aborted) return
        setError(getErrorMessage(requestError))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialWeather()

    return () => activeRequest.current?.abort()
  }, [])

  return { weather, isLoading, error, search, searchByCurrentLocation }
}
