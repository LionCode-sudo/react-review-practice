type RecentSearchesProps = {
  items: string[]
  onSelect: (city: string) => void
  onClear: () => void
}

export function RecentSearches({ items, onSelect, onClear }: RecentSearchesProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Recent searches" className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400">Recent:</span>
      {items.map((city) => (
        <button
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          key={city}
          onClick={() => onSelect(city)}
          type="button"
        >
          {city}
        </button>
      ))}
      <button
        aria-label="Clear recent searches"
        className="ml-1 text-xs text-slate-500 underline underline-offset-4 hover:text-slate-300"
        onClick={onClear}
        type="button"
      >
        Clear
      </button>
    </nav>
  )
}
