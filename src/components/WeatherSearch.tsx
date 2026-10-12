import { useState, type FormEvent } from 'react'

type WeatherSearchProps = {
  isLoading: boolean
  onSearch: (city: string) => void
}

export function WeatherSearch({ isLoading, onSearch }: WeatherSearchProps) {
  const [city, setCity] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(city)
  }

  return (
    <form className="flex w-full gap-2 sm:max-w-md" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="city-search">
        Search for a city
      </label>
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 shadow-inner shadow-white/5 transition focus-within:border-cyan-200/60 focus-within:bg-white/15">
        <svg
          aria-hidden="true"
          className="size-5 shrink-0 text-slate-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          autoComplete="off"
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          id="city-search"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Search any city…"
          type="search"
          value={city}
        />
      </div>
      <button
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? 'Loading' : 'Search'}
      </button>
    </form>
  )
}
