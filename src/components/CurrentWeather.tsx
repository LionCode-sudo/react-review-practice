import { formatTemperature, getWeatherPresentation } from '../lib/weather'
import type { TemperatureUnit, WeatherData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

type CurrentWeatherProps = {
  unit: TemperatureUnit
  weather: WeatherData
  onUnitChange: (unit: TemperatureUnit) => void
}

export function CurrentWeather({ weather, unit, onUnitChange }: CurrentWeatherProps) {
  const conditions = getWeatherPresentation(weather.current.weatherCode)
  const region = [weather.location.admin1, weather.location.country]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(', ')

  return (
    <section
      aria-label="Current weather"
      className="relative isolate overflow-hidden rounded-[2rem] border border-white/15 bg-linear-to-br from-indigo-500/35 via-slate-800/70 to-slate-950/60 p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-20 -z-10 size-72 rounded-full bg-cyan-300/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 left-1/3 -z-10 size-64 rounded-full bg-indigo-400/20 blur-3xl"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Current weather
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {weather.location.name}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{region}</p>
        </div>

        <div
          aria-label="Temperature unit"
          className="flex rounded-full border border-white/15 bg-slate-950/30 p-1"
          role="group"
        >
          <button
            aria-pressed={unit === 'celsius'}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${unit === 'celsius' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
            onClick={() => onUnitChange('celsius')}
            type="button"
          >
            °C
          </button>
          <button
            aria-pressed={unit === 'fahrenheit'}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${unit === 'fahrenheit' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
            onClick={() => onUnitChange('fahrenheit')}
            type="button"
          >
            °F
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <WeatherIcon
            className="size-20 shrink-0 text-cyan-100 drop-shadow-[0_0_18px_rgba(165,243,252,0.25)] sm:size-24"
            kind={conditions.kind}
          />
          <div>
            <p className="text-6xl font-light leading-none tracking-[-0.07em] text-white sm:text-7xl">
              {formatTemperature(weather.current.temperature, unit)}
            </p>
            <p className="mt-3 text-base font-medium text-slate-200">{conditions.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:min-w-72">
          <WeatherMetric
            label="Feels like"
            value={formatTemperature(weather.current.feelsLike, unit)}
          />
          <WeatherMetric label="Humidity" value={`${weather.current.humidity}%`} />
          <WeatherMetric label="Wind" value={`${Math.round(weather.current.windSpeed)} km/h`} />
        </div>
      </div>

      <p className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-400">
        {weather.current.isDay ? 'Daytime conditions' : 'Tonight’s conditions'} · Local forecast
      </p>
    </section>
  )
}

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 whitespace-nowrap text-sm font-semibold text-white sm:text-base">
        {value}
      </p>
    </div>
  )
}
