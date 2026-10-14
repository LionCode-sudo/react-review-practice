import { formatHour, formatTemperature, getWeatherPresentation } from '../lib/weather'
import type { TemperatureUnit, WeatherData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

type HourlyForecastProps = {
  hourly: WeatherData['hourly']
  unit: TemperatureUnit
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  return (
    <section aria-labelledby="hourly-heading" className="mt-7">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-white" id="hourly-heading">
        Next 24 hours
      </h2>

      <ol className="flex gap-3 overflow-x-auto pb-2">
        {hourly.map((hour) => {
          const conditions = getWeatherPresentation(hour.weatherCode)

          return (
            <li
              className="flex w-20 shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3"
              key={hour.time}
            >
              <p className="text-xs font-semibold text-slate-300">{formatHour(hour.time)}</p>
              <WeatherIcon className="my-3 size-7 text-cyan-100" kind={conditions.kind} />
              <p className="text-sm font-semibold text-white">
                {formatTemperature(hour.temperature, unit)}
              </p>
              <p className="mt-1 text-xs text-cyan-100/65">{hour.precipitationChance}%</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
