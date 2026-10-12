import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeather } from './useWeather'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

describe('useWeather', () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads Colombo and maps current and five-day forecast data', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ results: [makeLocation()] }))
      .mockResolvedValueOnce(jsonResponse(makeForecast()))

    const { result } = renderHook(() => useWeather())

    await waitFor(() => expect(result.current.weather?.location.name).toBe('Colombo'))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.weather?.current).toEqual({
      temperature: 24.6,
      feelsLike: 26.2,
      humidity: 68,
      windSpeed: 14.2,
      weatherCode: 1,
      isDay: true,
    })
    expect(result.current.weather?.forecast).toHaveLength(5)

    const geocodingUrl = new URL(String(fetchMock.mock.calls[0][0]))
    expect(geocodingUrl.searchParams.get('name')).toBe('Colombo')

    const forecastUrl = new URL(String(fetchMock.mock.calls[1][0]))
    expect(forecastUrl.searchParams.get('latitude')).toBe('6.9271')
    expect(forecastUrl.searchParams.get('forecast_days')).toBe('5')
  })

  it('shows a helpful error and skips the forecast request when a city is not found', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ results: [] }))

    const { result } = renderHook(() => useWeather())

    await waitFor(() => expect(result.current.error).toContain("We couldn't find"))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.weather).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ignores a previous request after a newer city search aborts it', async () => {
    const initialSignal: { current: AbortSignal | null } = { current: null }

    fetchMock.mockImplementation((input, init) => {
      const url = new URL(String(input))
      const signal = init?.signal as AbortSignal

      if (
        url.hostname === 'geocoding-api.open-meteo.com' &&
        url.searchParams.get('name') === 'Colombo'
      ) {
        initialSignal.current = signal
        return new Promise((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Request aborted', 'AbortError')),
            { once: true },
          )
        })
      }

      if (url.hostname === 'geocoding-api.open-meteo.com') {
        return Promise.resolve(jsonResponse({ results: [makeLocation('Tokyo')] }))
      }

      return Promise.resolve(jsonResponse(makeForecast()))
    })

    const { result } = renderHook(() => useWeather())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    await act(async () => {
      await result.current.search('Tokyo')
    })

    expect(initialSignal.current?.aborted).toBe(true)
    expect(result.current.weather?.location.name).toBe('Tokyo')
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })
})
