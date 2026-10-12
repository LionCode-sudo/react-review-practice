import { useState } from 'react'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useWeather } from '../hooks/useWeather'
import type { TemperatureUnit } from '../types/weather'
import { CurrentWeather } from './CurrentWeather'
import { ForecastList } from './ForecastList'
import { RecentSearches } from './RecentSearches'
import { WeatherSearch } from './WeatherSearch'

export function WeatherDashboard() {
  const { weather, isLoading, error, search } = useWeather()
  const { recent, addRecent, clearRecent } = useRecentSearches()
  const [unit, setUnit] = useState<TemperatureUnit>('celsius')

  function handleSearch(city: string) {
    void search(city)
    addRecent(city)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(34,211,238,0.15),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-6 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
              <span className="grid size-8 place-items-center rounded-xl bg-cyan-300 text-slate-950">
                <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </span>
              DAYLIGHT
            </div>
            <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              A little more prepared for the day.
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
              Clear, local forecasts for wherever you’re headed.
            </p>
          </div>
          <WeatherSearch isLoading={isLoading} onSearch={handleSearch} />
        </header>

        <RecentSearches items={recent} onClear={clearRecent} onSelect={handleSearch} />

        {error && (
          <p
            className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
            role="alert"
          >
            <span>{error}</span>
          </p>
        )}

        {isLoading && !weather && <WeatherLoading />}
        {weather && (
          <>
            <CurrentWeather onUnitChange={setUnit} unit={unit} weather={weather} />
            <ForecastList forecast={weather.forecast} unit={unit} />
          </>
        )}

        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>Forecasts are a guide. Make room for the unexpected.</p>
          <p>
            Weather data by{' '}
            <a
              className="text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white"
              href="https://open-meteo.com/"
              rel="noreferrer"
              target="_blank"
            >
              Open-Meteo
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}

function WeatherLoading() {
  return (
    <div
      aria-label="Loading weather forecast"
      aria-live="polite"
      className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="size-4 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200" />
        Finding your forecast…
      </div>
      <div className="mt-8 h-32 animate-pulse rounded-2xl bg-white/5" />
    </div>
  )
}
