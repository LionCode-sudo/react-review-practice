import { useState } from 'react'

const STORAGE_KEY = 'recent-searches'
const MAX_RECENT = 5

function loadRecent(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(loadRecent)

  function addRecent(city: string) {
    const term = city.trim()
    if (!term) return

    const next = [term, ...recent.filter((item) => item !== term)].slice(0, MAX_RECENT)
    setRecent(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function clearRecent() {
    setRecent([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return { recent, addRecent, clearRecent }
}
