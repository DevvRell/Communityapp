import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, CloudSun, Train, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { useUpcomingEvents } from '../services/apiClient'
import type { Event } from '../types/api'

// ── East New York coordinates ─────────────────────────────────────────────────
const LAT = 40.6654
const LON = -73.8875
// ── YouTube: replace with your actual channel ID ──────────────────────────────
const YOUTUBE_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE'
// ── MTA lines that serve East New York ───────────────────────────────────────
const ENY_LINES = ['A', 'C', 'J', 'Z', 'L']

// ── Weather code → label + emoji ─────────────────────────────────────────────
function weatherLabel(code: number): { label: string; emoji: string } {
  if (code === 0)                 return { label: 'Clear sky',       emoji: '☀️' }
  if (code <= 3)                  return { label: 'Partly cloudy',   emoji: '⛅' }
  if (code <= 48)                 return { label: 'Foggy',           emoji: '🌫️' }
  if (code <= 57)                 return { label: 'Drizzle',         emoji: '🌦️' }
  if (code <= 67)                 return { label: 'Rainy',           emoji: '🌧️' }
  if (code <= 77)                 return { label: 'Snowy',           emoji: '❄️' }
  if (code <= 82)                 return { label: 'Rain showers',    emoji: '🌧️' }
  if (code <= 86)                 return { label: 'Snow showers',    emoji: '🌨️' }
  return                                 { label: 'Thunderstorms',   emoji: '⛈️' }
}

// ── MTA status color ──────────────────────────────────────────────────────────
function statusColor(status: string) {
  if (!status || status === 'Good Service') return 'text-green-600 bg-green-50'
  if (status.includes('Delay'))             return 'text-yellow-700 bg-yellow-50'
  return                                           'text-red-600 bg-red-50'
}

// ── Line badge colors (MTA standard) ─────────────────────────────────────────
const LINE_COLORS: Record<string, string> = {
  A: 'bg-blue-600', C: 'bg-blue-600',
  J: 'bg-amber-700', Z: 'bg-amber-700',
  L: 'bg-gray-600',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

// ─────────────────────────────────────────────────────────────────────────────

interface WeatherData {
  current: {
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
    relative_humidity_2m: number
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
  }
}

interface MtaLine {
  id: string
  name: string
  status: string
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TestHomePage() {
  const [weather, setWeather]       = useState<WeatherData | null>(null)
  const [weatherErr, setWeatherErr] = useState<string | null>(null)
  const [mtaLines, setMtaLines]     = useState<MtaLine[]>([])
  const [mtaErr, setMtaErr]         = useState<string | null>(null)
  const [mtaLoading, setMtaLoading] = useState(true)

  const { data: upcomingEvents, loading: eventsLoading, error: eventsError } = useUpcomingEvents()

  // ── Weather fetch (Open-Meteo, no API key needed) ─────────────────────────
  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=4&timezone=America%2FNew_York`
    )
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => setWeatherErr('Weather unavailable'))
  }, [])

  // ── MTA fetch (goodservice.io public API) ─────────────────────────────────
  useEffect(() => {
    setMtaLoading(true)
    fetch('https://www.goodservice.io/api/routes?detailed=true')
      .then((r) => r.json())
      .then((data) => {
        const routes: MtaLine[] = ENY_LINES.map((id) => {
          const route = data.routes?.[id]
          return {
            id,
            name: route?.name || id,
            status: route?.status || 'Good Service',
          }
        })
        setMtaLines(routes)
        setMtaLoading(false)
      })
      .catch(() => {
        setMtaErr('Train status unavailable')
        setMtaLoading(false)
      })
  }, [])

  const wc = weather ? weatherLabel(weather.current.weather_code) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-primary-700 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">East New York — Daily Report</h1>
          <p className="text-primary-200 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── Top row: Weather + MTA ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Weather card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CloudSun className="text-primary-600" size={22} />
              <h2 className="text-lg font-semibold text-gray-900">Today's Weather</h2>
              <span className="text-xs text-gray-400 ml-auto">East New York, Brooklyn</span>
            </div>

            {!weather && !weatherErr && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-primary-400" size={28} />
              </div>
            )}

            {weatherErr && (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <AlertCircle size={16} />
                {weatherErr}
              </div>
            )}

            {weather && wc && (
              <>
                {/* Current */}
                <div className="flex items-end gap-4 mb-6">
                  <span className="text-6xl">{wc.emoji}</span>
                  <div>
                    <div className="text-5xl font-bold text-gray-900">
                      {Math.round(weather.current.temperature_2m)}°F
                    </div>
                    <div className="text-gray-500 mt-1">{wc.label}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Wind {Math.round(weather.current.wind_speed_10m)} mph · Humidity {weather.current.relative_humidity_2m}%
                    </div>
                  </div>
                </div>

                {/* 4-day forecast */}
                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                  {weather.daily.time.slice(0, 4).map((date, i) => {
                    const { emoji } = weatherLabel(weather.daily.weather_code[i])
                    return (
                      <div key={date} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{i === 0 ? 'Today' : formatDay(date)}</div>
                        <div className="text-xl mb-1">{emoji}</div>
                        <div className="text-sm font-semibold">{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                        <div className="text-xs text-gray-400">{Math.round(weather.daily.temperature_2m_min[i])}°</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* MTA Train Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Train className="text-primary-600" size={22} />
              <h2 className="text-lg font-semibold text-gray-900">Train Status</h2>
              <span className="text-xs text-gray-400 ml-auto">Lines serving East NY</span>
            </div>

            {mtaLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-primary-400" size={28} />
              </div>
            )}

            {mtaErr && (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <AlertCircle size={16} />
                {mtaErr}
              </div>
            )}

            {!mtaLoading && !mtaErr && (
              <div className="space-y-3">
                {mtaLines.map((line) => (
                  <div key={line.id} className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${LINE_COLORS[line.id] ?? 'bg-gray-500'}`}>
                      {line.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{line.name || `${line.id} Train`}</div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${statusColor(line.status)}`}>
                        {line.status || 'Good Service'}
                      </span>
                    </div>
                  </div>
                ))}
                <a
                  href="https://www.goodservice.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2"
                >
                  Powered by goodservice.io <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── District Map ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">District Map</h2>
            <span className="text-xs text-gray-400 ml-auto">East New York, Brooklyn</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '360px' }}>
            <iframe
              title="East New York District Map"
              width="100%"
              height="100%"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9250%2C40.6350%2C-73.8450%2C40.7000&layer=mapnik&marker=40.6654%2C-73.8875"
              style={{ border: 0 }}
            />
          </div>
          <a
            href="https://www.openstreetmap.org/#map=14/40.6654/-73.8875"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2"
          >
            View larger map <ExternalLink size={11} />
          </a>
        </div>

        {/* ── Upcoming Events ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-primary-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <a href="/events" className="text-sm text-primary-600 hover:underline ml-auto">
              See all →
            </a>
          </div>

          {eventsLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-primary-400" size={28} />
            </div>
          )}

          {eventsError && (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
              <AlertCircle size={16} />
              Could not load events.
            </div>
          )}

          {!eventsLoading && !eventsError && (!upcomingEvents || upcomingEvents.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="mx-auto mb-2" size={32} />
              <p className="text-sm">No upcoming events. Check back soon!</p>
            </div>
          )}

          {!eventsLoading && upcomingEvents && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(upcomingEvents as Event[]).slice(0, 6).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={13} />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── YouTube Channel ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="text-red-600" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Community Channel</h2>
          </div>

          {YOUTUBE_CHANNEL_ID === 'YOUR_CHANNEL_ID_HERE' ? (
            <div className="rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16 text-center px-4">
              <svg className="text-red-400 mb-3" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
              </svg>
              <p className="text-gray-600 font-medium mb-1">YouTube Channel Placeholder</p>
              <p className="text-sm text-gray-400">
                Replace <code className="bg-gray-100 px-1 rounded">YOUR_CHANNEL_ID_HERE</code> in{' '}
                <code className="bg-gray-100 px-1 rounded">TestHomePage.tsx</code> with your YouTube channel ID.
              </p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <iframe
                title="Community YouTube Channel"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed?listType=user_uploads&list=${YOUTUBE_CHANNEL_ID}&autoplay=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
