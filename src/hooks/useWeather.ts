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
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while loading the forecast.'
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const search = useCallback(async (searchTerm: string): Promise<WeatherData | null> => {
    const query = searchTerm.trim()

    if (!query) {
      setError('Enter a city name to see its forecast.')
      return null
    }

    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller

    setWeather(null)
    setError(null)
    setIsLoading(true)

    try {
      const result = await requestWeather(query, controller.signal)
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
  }, [])

  const searchByCoordinates = useCallback(
    async (latitude: number, longitude: number): Promise<WeatherData | null> => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller

      setWeather(null)
      setError(null)
      setIsLoading(true)

      try {
        const result = await requestForecast(
          { name: 'Your location', latitude, longitude },
          controller.signal,
        )
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

  return { weather, isLoading, error, search, searchByCoordinates }
}
