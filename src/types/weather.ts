export type TemperatureUnit = 'celsius' | 'fahrenheit'

export type WeatherKind =
  'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export type WeatherLocation = {
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}

export type CurrentConditions = {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
}

export type ForecastDay = {
  date: string
  weatherCode: number
  high: number
  low: number
  precipitationChance: number
}

export type WeatherData = {
  location: WeatherLocation
  current: CurrentConditions
  forecast: ForecastDay[]
}

export type WeatherPresentation = {
  label: string
  kind: WeatherKind
}
