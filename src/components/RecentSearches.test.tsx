import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { jsonResponse, makeForecast, makeLocation } from '../test/weatherFixtures'

const NOT_FOUND = 'Nowhereville'

async function searchFor(user: ReturnType<typeof userEvent.setup>, city: string) {
  const input = screen.getByRole('searchbox', { name: 'Search for a city' })
  await user.clear(input)
  await user.type(input, city)
  await user.click(screen.getByRole('button', { name: 'Search' }))
}

function recentChips() {
  const nav = screen.queryByRole('navigation', { name: 'Recent searches' })
  if (!nav) return []

  return within(nav)
    .getAllByRole('button')
    .map((button) => button.textContent)
    .filter((text) => text !== 'Clear')
}

describe('recent searches', () => {
  beforeEach(() => {
    localStorage.clear()

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input) => {
        const url = new URL(String(input))

        if (url.hostname === 'geocoding-api.open-meteo.com') {
          const city = url.searchParams.get('name') ?? 'Colombo'
          const results = city === NOT_FOUND ? undefined : [makeLocation(city)]
          return Promise.resolve(jsonResponse({ results }))
        }

        return Promise.resolve(jsonResponse(makeForecast()))
      }),
    )
  })

  it('remembers searched cities and lets the user search them again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')
    await screen.findByRole('heading', { name: 'Tokyo' })
    expect(recentChips()).toEqual(['Tokyo'])

    await searchFor(user, 'Paris')
    await screen.findByRole('heading', { name: 'Paris' })

    const recent = screen.getByRole('navigation', { name: 'Recent searches' })
    await user.click(within(recent).getByRole('button', { name: 'Tokyo' }))
    await screen.findByRole('heading', { name: 'Tokyo' })
    expect(recentChips()).toEqual(['Tokyo', 'Paris'])
  })

  it('clears the list', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')
    await screen.findByRole('heading', { name: 'Tokyo' })

    await user.click(screen.getByRole('button', { name: 'Clear recent searches' }))
    expect(screen.queryByRole('navigation', { name: 'Recent searches' })).not.toBeInTheDocument()
  })

  it('keeps recent searches after the app is reloaded', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')
    await screen.findByRole('heading', { name: 'Tokyo' })
    unmount()

    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })
    expect(recentChips()).toEqual(['Tokyo'])
  })

  it('keeps only the 5 most recent cities, newest first', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    for (const city of ['Tokyo', 'Paris', 'Lima', 'Oslo', 'Cairo', 'Seoul']) {
      await searchFor(user, city)
      await screen.findByRole('heading', { name: city })
    }

    expect(recentChips()).toEqual(['Seoul', 'Cairo', 'Oslo', 'Lima', 'Paris'])
  })

  it('shows one chip when the same city is searched with different casing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'kandy')
    await screen.findByRole('heading', { name: 'kandy' })
    await searchFor(user, 'Kandy')
    await screen.findByRole('heading', { name: 'Kandy' })

    expect(recentChips()).toEqual(['Kandy'])
  })

  it('does not save a search that fails', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, NOT_FOUND)
    await screen.findByRole('alert')

    expect(recentChips()).toEqual([])
  })

  it.each(['not json', '{"city":"Tokyo"}', '[1, null, "Tokyo"]'])(
    'does not crash when localStorage holds %s',
    async (stored) => {
      localStorage.setItem('recent-searches', stored)

      render(<App />)

      expect(await screen.findByRole('heading', { name: 'Colombo' })).toBeInTheDocument()
      expect(recentChips()).toEqual(stored === '[1, null, "Tokyo"]' ? ['Tokyo'] : [])
    },
  )

  it('still works when localStorage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')

    expect(await screen.findByRole('heading', { name: 'Tokyo' })).toBeInTheDocument()
    expect(recentChips()).toEqual(['Tokyo'])
  })

  it('fills the search box when a recent search is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')
    await screen.findByRole('heading', { name: 'Tokyo' })
    await searchFor(user, 'Paris')
    await screen.findByRole('heading', { name: 'Paris' })

    const searchBox = screen.getByRole('searchbox', { name: 'Search for a city' })
    expect(searchBox).toHaveValue('Paris')

    const recent = screen.getByRole('navigation', { name: 'Recent searches' })
    await user.click(within(recent).getByRole('button', { name: 'Tokyo' }))

    expect(searchBox).toHaveValue('Tokyo')
    expect(await screen.findByRole('heading', { name: 'Tokyo' })).toBeInTheDocument()
  })

  it('lets the user keep editing the search box after picking a recent search', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Colombo' })

    await searchFor(user, 'Tokyo')
    await screen.findByRole('heading', { name: 'Tokyo' })

    const recent = screen.getByRole('navigation', { name: 'Recent searches' })
    await user.click(within(recent).getByRole('button', { name: 'Tokyo' }))
    await screen.findByRole('heading', { name: 'Tokyo' })

    await searchFor(user, 'Oslo')

    expect(await screen.findByRole('heading', { name: 'Oslo' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search for a city' })).toHaveValue('Oslo')
  })
})
