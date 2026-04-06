import { getVisibleTimeRange } from './scales'
import type { TimelineEnvironment } from './layers'
import type { TimelineSpan } from './types'
import { getCivilDateAtNoonUtc, getHebrewDayInfo, getHebrewDaylightCivilDate, getHebrewWeekdayName, getZmanimForCivilDate } from './hebrewTime'

export type HebrewIntradayPointRankClass =
  | 'tick-rank-ordinary'
  | 'tick-rank-secondary'
  | 'tick-rank-primary'

export type HebrewIntradayPointData = {
  id: string
  timeMs: number
  label: string
  rankClass: HebrewIntradayPointRankClass
  kind: 'proportional-hour-marker' | 'named-intraday-marker'
  source: 'proportional-hour' | 'alot' | 'misheyakir' | 'netz' | 'shma' | 'tfilla' | 'chatzot' | 'mincha-gedola' | 'mincha-ketana' | 'plag' | 'shkiah' | 'tzeit' | 'chatzot-night' | 'shabbat-ends'
  stripeIndex: number
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

type HebrewIntradayCollectionOptions = {
  clipPointsToBufferedRange: boolean
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

const DAY_MS = 24 * 60 * 60 * 1000
const HEBREW_INTRADAY_SEQUENCE_SIZE = 12

const getAbsoluteDayIndex = (civilDate: Date) => Math.floor(civilDate.getTime() / DAY_MS)

export const isNamedHebrewIntradayPoint = (point: HebrewIntradayPointData) =>
  point.kind === 'named-intraday-marker'

export const isProportionalHourMarkerPoint = (point: HebrewIntradayPointData) =>
  point.kind === 'proportional-hour-marker'

export const getHebrewIntradayDayPoints = (
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TimelineEnvironment,
) => collectHebrewIntradayPoints(
  focusTimeMs,
  visibleDurationMs,
  environment,
  { clipPointsToBufferedRange: true },
)

export const formatHebrewIntradayPointLabel = (
  point: HebrewIntradayPointData,
  isLeading: boolean,
  environment: TimelineEnvironment,
) => {
  if (point.source !== 'shkiah') {
    return point.label
  }

  const dayInfo = getHebrewDayInfo(new Date(point.timeMs), environment)
  const weekdayName = getHebrewWeekdayName(dayInfo.hdate.getDay())
  const dayNumber = dayInfo.hebrewDate.day
  const civilTime = point.label.split(', ').slice(1).join(', ')

  return isLeading
    ? `${weekdayName} ${dayNumber} - Shkiah, ${civilTime}`
    : `Shkiah, ${civilTime} - ${dayNumber}, ${weekdayName}`
}

const collectHebrewIntradayPoints = (
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TimelineEnvironment,
  { clipPointsToBufferedRange }: HebrewIntradayCollectionOptions,
) => {
  const { bufferedStart, bufferedEnd } = getBufferedVisibleRange(focusTimeMs, visibleDurationMs)
  const points = new Map<number, HebrewIntradayPointData>()

  let civilDate = getCivilDateAtNoonUtc(new Date(bufferedStart))
  civilDate.setUTCDate(civilDate.getUTCDate() - 1)

  while (civilDate.getTime() <= bufferedEnd + 24 * 60 * 60 * 1000) {
    const absoluteDayIndex = getAbsoluteDayIndex(civilDate)
    const dayInfo = getHebrewDayInfo(new Date(civilDate), environment)
    const daylightCivilDate = getHebrewDaylightCivilDate(dayInfo, environment)
    const zmanim = getZmanimForCivilDate(daylightCivilDate, environment)
    const boundaries = getDaylightBoundaries(zmanim.sunrise(), zmanim.sunset())

    for (let hourIndex = 1; hourIndex < boundaries.length - 1; hourIndex++) {
      const timeMs = boundaries[hourIndex]
      if ((clipPointsToBufferedRange && (timeMs < bufferedStart || timeMs > bufferedEnd)) || points.has(timeMs)) {
        continue
      }

      points.set(timeMs, {
        id: `hebrew-proportional-hour-${timeMs}`,
        timeMs,
        label: '',
        rankClass: 'tick-rank-ordinary',
        kind: 'proportional-hour-marker',
        source: 'proportional-hour',
        stripeIndex: absoluteDayIndex * 100 + hourIndex,
      })
    }

    const namedMoments = [
      { id: 'alot', label: 'Alot 16.1°', time: zmanim.alotHaShachar(), slot: 0 },
      { id: 'misheyakir', label: 'Misheyakir 11.5°', time: zmanim.misheyakir(), slot: 1 },
      { id: 'netz', label: 'Netz', time: zmanim.sunrise(), slot: 2 },
      { id: 'shma', label: 'Shma', time: zmanim.sofZmanShma(), slot: 3 },
      { id: 'tfilla', label: 'Tfila', time: zmanim.sofZmanTfilla(), slot: 4 },
      { id: 'chatzot', label: 'Chatzot', time: zmanim.chatzot(), slot: 5 },
      { id: 'mincha-gedola', label: 'Mincha G.', time: zmanim.minchaGedola(), slot: 6 },
      { id: 'mincha-ketana', label: 'Mincha K.', time: zmanim.minchaKetana(), slot: 7 },
      { id: 'plag', label: 'Plag', time: zmanim.plagHaMincha(), slot: 8 },
      { id: 'shkiah', label: 'Shkiah', time: zmanim.sunset(), rankClass: 'tick-rank-secondary' as const, slot: 9 },
      { id: 'tzeit', label: 'Tzeit 8.5°', time: zmanim.tzeit(), slot: 10 },
      { id: 'chatzot-night', label: 'Chatzot Night', time: zmanim.chatzotNight(), slot: 11 },
    ]

    namedMoments.forEach(({ id, label, time, rankClass, slot }) => {
      const timeMs = time.getTime()
      if (clipPointsToBufferedRange && (timeMs < bufferedStart || timeMs > bufferedEnd)) {
        return
      }

      points.set(timeMs, {
        id: `hebrew-zman-${id}-${timeMs}`,
        timeMs,
        label: `${label}, ${formatCivilTime(time)}`,
        rankClass: rankClass ?? 'tick-rank-ordinary',
        kind: 'named-intraday-marker',
        source: id as HebrewIntradayPointData['source'],
        stripeIndex: absoluteDayIndex * HEBREW_INTRADAY_SEQUENCE_SIZE + slot,
      })
    })

    if (dayInfo.hdate.getDay() === 6) {
      const shabbatEnd = zmanim.tzeit()
      const timeMs = shabbatEnd.getTime()

      if (!clipPointsToBufferedRange || (timeMs >= bufferedStart && timeMs <= bufferedEnd)) {
        points.set(timeMs, {
          id: `hebrew-shabbat-ends-${timeMs}`,
          timeMs,
          label: `Shabbat Ends / Tzeit 8.5°, ${formatCivilTime(shabbatEnd)}`,
          rankClass: 'tick-rank-primary',
          kind: 'named-intraday-marker',
          source: 'shabbat-ends',
          stripeIndex: absoluteDayIndex * HEBREW_INTRADAY_SEQUENCE_SIZE + 10,
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
  const namedPoints = collectHebrewIntradayPoints(
    focusTimeMs,
    visibleDurationMs,
    environment,
    { clipPointsToBufferedRange: false },
  )
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
      stripeClass: startPoint.stripeIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b',
    })
  }

  return spans
}
