import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

describe('hourly forecast', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input) => {
        const url = new URL(String(input))

        if (url.hostname === 'geocoding-api.open-meteo.com') {
          return Promise.resolve(jsonResponse({ results: [makeLocation('Colombo')] }))
        }

        return Promise.resolve(jsonResponse(makeForecast()))
      }),
    )
  })

  it('shows the next 24 hours and follows the temperature unit', async () => {
    const user = userEvent.setup()
    render(<App />)

    const hourly = await screen.findByRole('region', { name: 'Next 24 hours' })
    const items = within(hourly).getAllByRole('listitem')
    expect(items).toHaveLength(24)

    const firstCelsius = within(items[0]).getByText(/°$/).textContent
    await user.click(screen.getByRole('button', { name: '°F' }))
    const firstFahrenheit = within(items[0]).getByText(/°$/).textContent

    expect(firstFahrenheit).not.toBe(firstCelsius)
  })
})
