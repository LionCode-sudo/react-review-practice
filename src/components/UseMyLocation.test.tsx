import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

type PendingLookup = {
  success?: PositionCallback
  error?: PositionErrorCallback
}

function stubGeolocation() {
  const pending: PendingLookup = {}
  const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success, error) => {
    pending.success = success
    pending.error = error ?? undefined
  })

  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })

  return { pending, getCurrentPosition }
}

const position = (latitude: number, longitude: number) =>
  ({ coords: { latitude, longitude } }) as GeolocationPosition

const positionError = (code: number) => ({ code, message: '' }) as GeolocationPositionError

describe('use my location', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation((input) => {
      const url = new URL(String(input))

      if (url.hostname === 'geocoding-api.open-meteo.com') {
        return Promise.resolve(jsonResponse({ results: [makeLocation('Colombo')] }))
      }

      return Promise.resolve(jsonResponse(makeForecast()))
    })

    vi.stubGlobal('fetch', fetchMock)
  })

  it('loads the forecast for the browser location', async () => {
    const user = userEvent.setup()
    const { pending, getCurrentPosition } = stubGeolocation()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await user.click(screen.getByRole('button', { name: 'Use my location' }))
    await act(async () => pending.success?.(position(7.2906, 80.6337)))

    expect(await screen.findByRole('heading', { name: 'Your location' })).toBeInTheDocument()
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ timeout: 10_000 }),
    )

    const forecastCall = fetchMock.mock.calls
      .map(([input]) => new URL(String(input)))
      .findLast((url) => url.hostname === 'api.open-meteo.com')

    expect(forecastCall?.searchParams.get('latitude')).toBe('7.2906')
    expect(forecastCall?.searchParams.get('longitude')).toBe('80.6337')
  })

  it('disables the button while waiting for the location and keeps the old forecast', async () => {
    const user = userEvent.setup()
    const { pending, getCurrentPosition } = stubGeolocation()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    const button = screen.getByRole('button', { name: 'Use my location' })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Colombo' })).toBeInTheDocument()

    await user.click(button)
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)

    await act(async () => pending.success?.(position(7.2906, 80.6337)))
    await screen.findByRole('heading', { name: 'Your location' })
    expect(button).toBeEnabled()
  })

  it('explains when location access is denied and keeps the current forecast', async () => {
    const user = userEvent.setup()
    const { pending } = stubGeolocation()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await user.click(screen.getByRole('button', { name: 'Use my location' }))
    await act(async () => pending.error?.(positionError(1)))

    expect(await screen.findByRole('alert')).toHaveTextContent('Location access was denied')
    expect(screen.getByRole('heading', { name: 'Colombo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use my location' })).toBeEnabled()
  })

  it('shows a message instead of throwing when the browser has no geolocation', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('navigator', {})
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await user.click(screen.getByRole('button', { name: 'Use my location' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("can't share your location")
    expect(screen.getByRole('heading', { name: 'Colombo' })).toBeInTheDocument()
  })
})
