import type { WeatherKind } from '../types/weather'

type WeatherIconProps = {
  kind: WeatherKind
  className?: string
}

export function WeatherIcon({ kind, className = '' }: WeatherIconProps) {
  const sharedProps = {
    'aria-hidden': true as const,
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 64 64',
  }

  if (kind === 'clear') {
    return (
      <svg {...sharedProps}>
        <circle cx="32" cy="32" r="10" />
        <path d="M32 5v8m0 38v8M5 32h8m38 0h8M13 13l6 6m26 26 6 6m0-38-6 6M19 45l-6 6" />
      </svg>
    )
  }

  if (kind === 'partly-cloudy') {
    return (
      <svg {...sharedProps}>
        <circle cx="42" cy="21" r="8" />
        <path d="M42 5v4m0 24v4m16-16h-4m-24 0h-4m27-11-3 3m-17 17-3 3m23 0-3-3M19 49h27a9 9 0 0 0 0-18 13 13 0 0 0-25-2 10 10 0 0 0-2 20Z" />
      </svg>
    )
  }

  if (kind === 'fog' || kind === 'cloudy') {
    return (
      <svg {...sharedProps}>
        <path d="M16 39h32a10 10 0 0 0 0-20 15 15 0 0 0-29-2 11 11 0 0 0-3 22Z" />
        {kind === 'fog' && <path d="M13 47h38M19 54h26" />}
        {kind === 'cloudy' && <path d="M21 48h22" />}
      </svg>
    )
  }

  if (kind === 'snow') {
    return (
      <svg {...sharedProps}>
        <path d="M16 35h32a10 10 0 0 0 0-20 15 15 0 0 0-29-2 11 11 0 0 0-3 22Z" />
        <path d="m21 44 4 4m0-4-4 4m15-4 4 4m0-4-4 4m-7 8 3 3m0-3-3 3" />
      </svg>
    )
  }

  if (kind === 'storm') {
    return (
      <svg {...sharedProps}>
        <path d="M16 35h32a10 10 0 0 0 0-20 15 15 0 0 0-29-2 11 11 0 0 0-3 22Z" />
        <path d="m34 38-8 13h8l-3 10 11-16h-8l4-7" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="M16 35h32a10 10 0 0 0 0-20 15 15 0 0 0-29-2 11 11 0 0 0-3 22Z" />
      {kind === 'drizzle' ? (
        <path d="m23 43-2 5m13-5-2 5m13-5-2 5" />
      ) : (
        <path d="m24 42-4 9m17-9-4 9m17-9-4 9" />
      )}
    </svg>
  )
}
