import { getVisibleTimeRange } from './scales'
import type { TimelineEnvironment } from './layers'
import type { TimelineSpan } from './types'
import { getCivilDateAtNoonUtc, getHebrewDayInfo, getHebrewDaylightCivilDate, getZmanimForCivilDate } from './hebrewTime'

export type HebrewIntradayPointRankClass =
  | 'tick-rank-ordinary'
  | 'tick-rank-secondary'
  | 'tick-rank-primary'

export type HebrewIntradayPointData = {
  id: string
  timeMs: number
  label: string
  rankClass: HebrewIntradayPointRankClass
}

type HebrewIntradaySpanData = {
  span: TimelineSpan
  stripeClass: 'structural-span-stripe-a' | 'structural-span-stripe-b'
}

const formatCivilTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const getBufferedVisibleRange = (focusTimeMs: number, visibleDurationMs: number) => {
  const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)

  return {
    bufferedStart: startTimeMs - visibleDurationMs * 0.5,
    bufferedEnd: endTimeMs + visibleDurationMs * 0.5,
  }
}

const getDaylightBoundaries = (sunrise: Date, sunset: Date) => {
  const daylightMs = sunset.getTime() - sunrise.getTime()
  if (daylightMs <= 0) {
    return []
  }

  const proportionalHourMs = daylightMs / 12
  const boundaries = [sunrise.getTime()]

  for (let hourIndex = 1; hourIndex < 12; hourIndex++) {
    boundaries.push(sunrise.getTime() + proportionalHourMs * hourIndex)
  }

  boundaries.push(sunset.getTime())
  return boundaries
}

export const isNamedHebrewIntradayPoint = (point: HebrewIntradayPointData) => point.label !== ''

export const isProportionalHourMarkerPoint = (point: HebrewIntradayPointData) =>
  point.rankClass === 'tick-rank-ordinary' && point.label === ''

export const getHebrewIntradayDayPoints = (
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TimelineEnvironment,
) => {
  const { bufferedStart, bufferedEnd } = getBufferedVisibleRange(focusTimeMs, visibleDurationMs)
  const points = new Map<number, HebrewIntradayPointData>()

  let civilDate = getCivilDateAtNoonUtc(new Date(bufferedStart))
  civilDate.setUTCDate(civilDate.getUTCDate() - 1)

  while (civilDate.getTime() <= bufferedEnd + 24 * 60 * 60 * 1000) {
    const dayInfo = getHebrewDayInfo(new Date(civilDate), environment)
    const daylightCivilDate = getHebrewDaylightCivilDate(dayInfo, environment)
    const zmanim = getZmanimForCivilDate(daylightCivilDate, environment)
    const boundaries = getDaylightBoundaries(zmanim.sunrise(), zmanim.sunset())

    for (let hourIndex = 1; hourIndex < boundaries.length - 1; hourIndex++) {
      const timeMs = boundaries[hourIndex]
      if (timeMs < bufferedStart || timeMs > bufferedEnd || points.has(timeMs)) {
        continue
      }

      points.set(timeMs, {
        id: `hebrew-proportional-hour-${timeMs}`,
        timeMs,
        label: '',
        rankClass: 'tick-rank-ordinary',
      })
    }

    const namedMoments = [
      { id: 'alot', label: 'Alot 16.1°', time: zmanim.alotHaShachar() },
      { id: 'misheyakir', label: 'Misheyakir 11.5°', time: zmanim.misheyakir() },
      { id: 'netz', label: 'Netz', time: zmanim.sunrise() },
      { id: 'shma', label: 'Shma', time: zmanim.sofZmanShma() },
      { id: 'tfilla', label: 'Tfila', time: zmanim.sofZmanTfilla() },
      { id: 'chatzot', label: 'Chatzot', time: zmanim.chatzot() },
      { id: 'chatzot-night', label: 'Chatzot Night', time: zmanim.chatzotNight() },
      { id: 'mincha-gedola', label: 'Mincha G.', time: zmanim.minchaGedola() },
      { id: 'mincha-ketana', label: 'Mincha K.', time: zmanim.minchaKetana() },
      { id: 'plag', label: 'Plag', time: zmanim.plagHaMincha() },
      { id: 'shkiah', label: 'Shkiah', time: zmanim.sunset() },
      { id: 'tzeit', label: 'Tzeit 8.5°', time: zmanim.tzeit(), rankClass: 'tick-rank-secondary' as const },
    ]

    namedMoments.forEach(({ id, label, time, rankClass }) => {
      const timeMs = time.getTime()
      if (timeMs < bufferedStart || timeMs > bufferedEnd) {
        return
      }

      points.set(timeMs, {
        id: `hebrew-zman-${id}-${timeMs}`,
        timeMs,
        label: `${label}, ${formatCivilTime(time)}`,
        rankClass: rankClass ?? 'tick-rank-ordinary',
      })
    })

    if (dayInfo.hdate.getDay() === 6) {
      const shabbatEnd = zmanim.tzeit()
      const timeMs = shabbatEnd.getTime()

      if (timeMs >= bufferedStart && timeMs <= bufferedEnd) {
        points.set(timeMs, {
          id: `hebrew-shabbat-ends-${timeMs}`,
          timeMs,
          label: `Shabbat Ends / Tzeit 8.5°, ${formatCivilTime(shabbatEnd)}`,
          rankClass: 'tick-rank-primary',
        })
      }
    }

    civilDate.setUTCDate(civilDate.getUTCDate() + 1)
  }

  return [...points.values()].sort((a, b) => a.timeMs - b.timeMs)
}

export const getDayViewIntradaySpans = (
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TimelineEnvironment,
) => {
  const namedPoints = getHebrewIntradayDayPoints(focusTimeMs, visibleDurationMs, environment)
    .filter(isNamedHebrewIntradayPoint)
  const spans: HebrewIntradaySpanData[] = []

  for (let segmentIndex = 0; segmentIndex < namedPoints.length - 1; segmentIndex++) {
    const startPoint = namedPoints[segmentIndex]
    const endPoint = namedPoints[segmentIndex + 1]

    if (endPoint.timeMs <= startPoint.timeMs) {
      continue
    }

    spans.push({
      span: {
        id: `hebrew-intraday-span-${startPoint.timeMs}`,
        kind: 'structural-period',
        startTimeMs: startPoint.timeMs,
        endTimeMs: endPoint.timeMs,
        label: startPoint.label,
      },
      stripeClass: segmentIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b',
    })
  }

  return spans
}
