import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

describe('weather dashboard', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockImplementation((input) => {
      const url = new URL(String(input))

      if (url.hostname === 'geocoding-api.open-meteo.com') {
        const city = url.searchParams.get('name') ?? 'Colombo'
        return Promise.resolve(jsonResponse({ results: [makeLocation(city)] }))
      }

      return Promise.resolve(jsonResponse(makeForecast()))
    })

    vi.stubGlobal('fetch', fetchMock)
  })

  it('searches for a city, displays its forecast, and switches temperature units', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Colombo' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(5)

    await user.type(screen.getByRole('searchbox', { name: 'Search for a city' }), 'Tokyo')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByRole('heading', { name: 'Tokyo' })).toBeInTheDocument()
    expect(screen.getByText('10% rain')).toBeInTheDocument()

    const currentWeather = screen.getByRole('region', { name: 'Current weather' })
    expect(within(currentWeather).getByText('25°')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '°F' }))

    expect(within(currentWeather).getByText('76°')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
  })
})
