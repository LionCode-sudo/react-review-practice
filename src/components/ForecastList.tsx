import { formatForecastDay, formatTemperature, getWeatherPresentation } from '../lib/weather'
import type { TemperatureUnit, WeatherData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

type ForecastListProps = {
  forecast: WeatherData['forecast']
  unit: TemperatureUnit
}

export function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="mt-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Plan ahead
          </p>
          <h2
            className="mt-1 text-xl font-semibold tracking-tight text-white"
            id="forecast-heading"
          >
            5-day forecast
          </h2>
        </div>
        <p className="text-xs text-slate-400">High / low</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {forecast.map((day, index) => {
          const conditions = getWeatherPresentation(day.weatherCode)

          return (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
              key={day.date}
            >
              <p className="text-sm font-semibold text-white">
                {index === 0 ? 'Today' : formatForecastDay(day.date)}
              </p>
              <WeatherIcon className="my-4 size-9 text-cyan-100" kind={conditions.kind} />
              <p className="text-xs text-slate-300">{conditions.label}</p>
              <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-white">
                  {formatTemperature(day.high, unit)}
                </span>
                <span className="text-slate-400">{formatTemperature(day.low, unit)}</span>
              </div>
              <p className="mt-2 text-xs text-cyan-100/65">{day.precipitationChance}% rain</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
