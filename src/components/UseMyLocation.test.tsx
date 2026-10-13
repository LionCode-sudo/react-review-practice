import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

describe('use my location', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockImplementation((input) => {
      const url = new URL(String(input))

      if (url.hostname === 'geocoding-api.open-meteo.com') {
        return Promise.resolve(jsonResponse({ results: [makeLocation('Colombo')] }))
      }

      return Promise.resolve(jsonResponse(makeForecast()))
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 7.2906, longitude: 80.6337 } } as GeolocationPosition),
      },
    })
  })

  it('loads the forecast for the browser location', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await user.click(screen.getByRole('button', { name: 'Use my location' }))

    expect(await screen.findByRole('heading', { name: 'Your location' })).toBeInTheDocument()

    const forecastCall = fetchMock.mock.calls
      .map(([input]) => new URL(String(input)))
      .findLast((url) => url.hostname === 'api.open-meteo.com')

    expect(forecastCall?.searchParams.get('latitude')).toBe('7.2906')
    expect(forecastCall?.searchParams.get('longitude')).toBe('80.6337')
  })
})
