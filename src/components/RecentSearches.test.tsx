import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

describe('recent searches', () => {
  beforeEach(() => {
    localStorage.clear()

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input) => {
        const url = new URL(String(input))

        if (url.hostname === 'geocoding-api.open-meteo.com') {
          const city = url.searchParams.get('name') ?? 'Colombo'
          return Promise.resolve(jsonResponse({ results: [makeLocation(city)] }))
        }

        return Promise.resolve(jsonResponse(makeForecast()))
      }),
    )
  })

  it('remembers searched cities and lets the user search them again', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { name: 'Colombo' })

    await user.type(screen.getByRole('searchbox', { name: 'Search for a city' }), 'Tokyo')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('heading', { name: 'Tokyo' })

    const recent = screen.getByRole('navigation', { name: 'Recent searches' })
    expect(within(recent).getByRole('button', { name: 'Tokyo' })).toBeInTheDocument()

    await user.click(within(recent).getByRole('button', { name: 'Clear' }))
    expect(screen.queryByRole('navigation', { name: 'Recent searches' })).not.toBeInTheDocument()
  })
})
