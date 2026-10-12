import { useEffect, useState } from 'react'

const STORAGE_KEY = 'recent-searches'
const MAX_RECENT = 5

// Recent searches are a convenience, so storage problems (corrupted data,
// quota exceeded, storage disabled) must never break the app.
function loadRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

function saveRecent(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore: the list just won't persist.
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(loadRecent)

  useEffect(() => {
    saveRecent(recent)
  }, [recent])

  function addRecent(city: string) {
    const term = city.trim()
    if (!term) return

    // Case-insensitive dedupe; keep the casing of the latest search.
    setRecent((previous) =>
      [term, ...previous.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_RECENT,
      ),
    )
  }

  function clearRecent() {
    setRecent([])
  }

  return { recent, addRecent, clearRecent }
}
