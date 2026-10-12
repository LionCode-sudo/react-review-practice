export function makeLocation(name = 'Colombo') {
  return {
    name,
    admin1: name,
    country: name === 'Tokyo' ? 'Japan' : 'Sri Lanka',
    latitude: name === 'Tokyo' ? 35.6762 : 6.9271,
    longitude: name === 'Tokyo' ? 139.6503 : 79.8612,
    timezone: name === 'Tokyo' ? 'Asia/Tokyo' : 'Asia/Colombo',
  }
}

export function makeForecast() {
  return {
    current: {
      temperature_2m: 24.6,
      relative_humidity_2m: 68,
      apparent_temperature: 26.2,
      is_day: 1,
      weather_code: 1,
      wind_speed_10m: 14.2,
    },
    daily: {
      time: ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'],
      weather_code: [1, 2, 3, 61, 95],
      temperature_2m_max: [28.4, 27.8, 26.2, 25.5, 24.1],
      temperature_2m_min: [22.1, 21.9, 21.4, 20.8, 19.7],
      precipitation_probability_max: [10, 20, 35, 70, 80],
    },
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}
