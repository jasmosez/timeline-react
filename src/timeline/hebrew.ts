import type { LeadingCalendarSystemId, TimelineLayer } from './layers'
import { positionTimelinePoint, positionTimelineSpan } from './layout'
import { getVisibleRangeStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan, TimelinePoint, TimelineSpan } from './types'
import { getCivilDateAtNoonUtc, getHebrewDayInfo, isHebrewQuarterStartMonth } from './hebrewTime'
import { getHebrewTickLabel } from './hebrewLabels'
import {
  formatHebrewIntradayPointLabel,
  getDayViewIntradaySpans,
  getHebrewIntradayDayPoints,
  isNamedHebrewIntradayPoint,
} from './hebrewIntraday'

type HebrewLayerParams = {
  leadingCalendarSystemId: LeadingCalendarSystemId
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  environment: Parameters<TimelineLayer['getPoints']>[0]['environment']
}

const HEBREW_ENABLED_SCALES: ScaleLevel[] = [-1, 0, 1, 2, 3, 4, 5, 6]
const ENABLE_HEBREW_QUARTER_WEEK_TICKS = false

const shouldEmitHebrewBoundary = (
  activeScaleLevel: ScaleLevel,
  dayInfo: ReturnType<typeof getHebrewDayInfo>,
) => {
  if (activeScaleLevel === 5) {
    return dayInfo.hebrewDate.day === 1
  }

  if (activeScaleLevel === 4) {
    return dayInfo.hebrewDate.day === 1
      || (ENABLE_HEBREW_QUARTER_WEEK_TICKS && dayInfo.hdate.getDay() === 0)
  }

  if (activeScaleLevel === 6) {
    return dayInfo.hebrewDate.day === 1 && dayInfo.hebrewDate.month === 7
  }

  if (activeScaleLevel === -1 || activeScaleLevel === 0 || activeScaleLevel === 1) {
    return false
  }

  return true
}

type HebrewBoundary = {
  timeMs: number
  label: string
}

const getHebrewSpanStripeClass = (
  activeScaleLevel: ScaleLevel,
  startTimeMs: number,
  environment: HebrewLayerParams['environment'],
) => {
  const startDate = new Date(startTimeMs)

  if (activeScaleLevel === 1) {
    const stripeIndex = startDate.getHours()
    return stripeIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
  }

  const dayInfo = getHebrewDayInfo(startDate, environment)
  const year = dayInfo.hebrewDate.year
  const monthsInYear = HEBREW_LEAP_POSITIONS.includes(((year - 1) % 19) + 1) ? 13 : 12
  const monthOrdinal = dayInfo.hebrewDate.month >= 7
    ? dayInfo.hebrewDate.month - 7
    : monthsInYear - 7 + dayInfo.hebrewDate.month
  const absoluteHebrewMonthIndex = getLeapYearsBeforeHebrewYear(year) + (year - 1) * 12 + monthOrdinal

  if (activeScaleLevel === 2 || activeScaleLevel === 3) {
    return dayInfo.hebrewDate.day % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
  }

  if (activeScaleLevel === 4 || activeScaleLevel === 5) {
    return absoluteHebrewMonthIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
  }

  return dayInfo.hebrewDate.year % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
}

const HEBREW_LEAP_POSITIONS = [3, 6, 8, 11, 14, 17, 19]

const getLeapYearsBeforeHebrewYear = (year: number) => {
  const priorYears = year - 1
  const fullCycles = Math.floor(priorYears / 19)
  const cycleRemainder = priorYears % 19

  return fullCycles * HEBREW_LEAP_POSITIONS.length
    + HEBREW_LEAP_POSITIONS.filter((position) => position <= cycleRemainder).length
}

const getHebrewTickRankClass = (
  activeScaleLevel: ScaleLevel,
  dayInfo: ReturnType<typeof getHebrewDayInfo>,
) => {
  switch (activeScaleLevel) {
    case -1:
    case 0:
      return 'tick-rank-primary'
    case 1:
      return 'tick-rank-secondary'
    case 2:
    case 3:
      if (dayInfo.hebrewDate.day === 1) {
        return 'tick-rank-primary'
      }
      if (dayInfo.hdate.getDay() === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 4:
      if (dayInfo.hebrewDate.day === 1) {
        return isHebrewQuarterStartMonth(dayInfo.hebrewDate.month)
          ? 'tick-rank-primary'
          : 'tick-rank-secondary'
      }
      if (ENABLE_HEBREW_QUARTER_WEEK_TICKS && dayInfo.hdate.getDay() === 0) {
        return 'tick-rank-ordinary'
      }
      return 'tick-rank-ordinary'
    case 5:
      return dayInfo.hebrewDate.month === 7 ? 'tick-rank-primary' : 'tick-rank-ordinary'
    case 6:
      if (dayInfo.hebrewDate.year % 7 === 1) {
        return 'tick-rank-primary'
      }
      return 'tick-rank-ordinary'
    default:
      return 'tick-rank-ordinary'
  }
}

const collectHebrewBoundaries = (
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: HebrewLayerParams['environment'],
): HebrewBoundary[] => {
  if (!HEBREW_ENABLED_SCALES.includes(activeScaleLevel)) {
    return []
  }

  const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStart = startTimeMs - visibleDurationMs * 0.5
  const bufferedEnd = endTimeMs + visibleDurationMs * 0.5
  const boundaries: HebrewBoundary[] = []

  let civilDate = getCivilDateAtNoonUtc(new Date(bufferedStart))
  civilDate.setUTCDate(civilDate.getUTCDate() - 1)

  while (civilDate.getTime() <= bufferedEnd + 24 * 60 * 60 * 1000) {
    const noonTimestamp = new Date(civilDate)
    const hebrewDayInfo = getHebrewDayInfo(noonTimestamp, environment)
    const boundaryTimeMs = hebrewDayInfo.startsAtSunset.getTime()

    if (
      boundaryTimeMs >= bufferedStart &&
      boundaryTimeMs <= bufferedEnd &&
      shouldEmitHebrewBoundary(activeScaleLevel, hebrewDayInfo)
    ) {
      boundaries.push({
        timeMs: boundaryTimeMs,
        label: getHebrewTickLabel(
          activeScaleLevel,
          hebrewDayInfo,
          boundaryTimeMs,
          true,
        ) ?? '',
      })
    }

    civilDate.setUTCDate(civilDate.getUTCDate() + 1)
  }

  return boundaries
}

const addHebrewYearQuarterBoundaryTicks = (
  points: PositionedTimelinePoint[],
  leadingCalendarSystemId: LeadingCalendarSystemId,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: HebrewLayerParams['environment'],
) => {
  const boundaries = collectHebrewBoundaries(5, focusTimeMs, visibleDurationMs, environment)

  boundaries.forEach(({ timeMs }) => {
    const dayInfo = getHebrewDayInfo(new Date(timeMs), environment)
    const isYearStart = dayInfo.hebrewDate.month === 7
    const isQuarterStart = isHebrewQuarterStartMonth(dayInfo.hebrewDate.month)

    if (!isQuarterStart || isYearStart) {
      return
    }

    points.push(
      positionTimelinePoint(
        {
          id: `hebrew-year-quarter-${timeMs}`,
          kind: 'tick',
          timeMs,
          label: '',
        },
        5,
        focusTimeMs,
        visibleDurationMs,
        getVisibleRangeStartTickDate(5, focusTimeMs, visibleDurationMs),
        {
          className: [
            leadingCalendarSystemId === 'hebrew'
              ? 'structural-tick-leading'
              : 'structural-tick-supporting',
            'hebrew-tick',
            'tick-rank-secondary',
          ].join(' '),
          labelClassName: leadingCalendarSystemId === 'hebrew'
            ? 'hebrew-label structural-label-leading'
            : 'hebrew-label structural-label-supporting',
        },
      ),
    )
  })
}

export const createHebrewStructuralPoints = ({
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  environment,
}: HebrewLayerParams): PositionedTimelinePoint[] => {
  const points: PositionedTimelinePoint[] = []
  const boundaries = activeScaleLevel === -1 || activeScaleLevel === 0 || activeScaleLevel === 1
    ? []
    : collectHebrewBoundaries(activeScaleLevel, focusTimeMs, visibleDurationMs, environment)

  boundaries.forEach(({ timeMs, label }) => {
    const dayInfo = getHebrewDayInfo(new Date(timeMs), environment)
    const point: TimelinePoint = {
      id: `hebrew-${timeMs}`,
      kind: 'tick',
      timeMs,
      label: getHebrewTickLabel(
        activeScaleLevel,
        dayInfo,
        timeMs,
        leadingCalendarSystemId === 'hebrew',
      ) ?? label,
    }

    points.push(
      positionTimelinePoint(
        point,
        activeScaleLevel,
        focusTimeMs,
        visibleDurationMs,
        new Date(timeMs),
        {
          className: [
            leadingCalendarSystemId === 'hebrew'
              ? 'structural-tick-leading'
              : 'structural-tick-supporting',
            'hebrew-tick',
            getHebrewTickRankClass(activeScaleLevel, dayInfo),
          ].join(' '),
          labelClassName: leadingCalendarSystemId === 'hebrew'
            ? 'hebrew-label structural-label-leading'
            : 'hebrew-label structural-label-supporting',
        },
      ),
    )
  })

  if (activeScaleLevel === -1 || activeScaleLevel === 0 || activeScaleLevel === 1) {
    getHebrewIntradayDayPoints(focusTimeMs, visibleDurationMs, environment)
      .filter(isNamedHebrewIntradayPoint)
      .forEach((point) => {
      points.push(
        positionTimelinePoint(
          {
            id: point.id,
            kind: 'tick',
            timeMs: point.timeMs,
            label: formatHebrewIntradayPointLabel(
              point,
              leadingCalendarSystemId === 'hebrew',
              environment,
            ),
          },
          activeScaleLevel,
          focusTimeMs,
          visibleDurationMs,
          new Date(point.timeMs),
          {
            className: [
              leadingCalendarSystemId === 'hebrew'
                ? 'structural-tick-leading'
                : 'structural-tick-supporting',
              'hebrew-tick',
              point.rankClass,
            ].join(' '),
            labelClassName: leadingCalendarSystemId === 'hebrew'
              ? 'hebrew-label structural-label-leading'
              : 'hebrew-label structural-label-supporting',
          },
        ),
      )
      })
  }

  if (activeScaleLevel === 5) {
    addHebrewYearQuarterBoundaryTicks(
      points,
      leadingCalendarSystemId,
      focusTimeMs,
      visibleDurationMs,
      environment,
    )
  }

  return points
}

export const createHebrewStructuralSpans = ({
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  environment,
}: HebrewLayerParams): PositionedTimelineSpan[] => {
  if (!HEBREW_ENABLED_SCALES.includes(activeScaleLevel)) {
    return []
  }

  if (activeScaleLevel === -1 || activeScaleLevel === 0 || activeScaleLevel === 1) {
    return getDayViewIntradaySpans(focusTimeMs, visibleDurationMs, environment).map(({ span, stripeClass }) =>
      positionTimelineSpan(span, focusTimeMs, visibleDurationMs, {
        className: [
          leadingCalendarSystemId === 'hebrew'
            ? 'hebrew-structural-span structural-span structural-span-leading'
            : 'hebrew-structural-span structural-span structural-span-supporting',
          stripeClass,
        ].join(' '),
        side: leadingCalendarSystemId === 'hebrew' ? 'leading' : 'supporting',
        labelTheme: 'hebrew',
      }),
    )
  }

  const boundaries = collectHebrewBoundaries(activeScaleLevel, focusTimeMs, visibleDurationMs, environment)
  const spans: TimelineSpan[] = []

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]
    const end = boundaries[i + 1]

    if (end.timeMs <= start.timeMs) {
      continue
    }

    spans.push({
      id: `hebrew-span-${start.timeMs}`,
      kind: 'structural-period',
      startTimeMs: start.timeMs,
      endTimeMs: end.timeMs,
      label: start.label,
    })
  }

  return spans.map((span) =>
    positionTimelineSpan(span, focusTimeMs, visibleDurationMs, {
      className: [
        leadingCalendarSystemId === 'hebrew'
          ? 'hebrew-structural-span structural-span structural-span-leading'
          : 'hebrew-structural-span structural-span structural-span-supporting',
        getHebrewSpanStripeClass(activeScaleLevel, span.startTimeMs, environment),
      ].join(' '),
      side: leadingCalendarSystemId === 'hebrew' ? 'leading' : 'supporting',
      labelTheme: 'hebrew',
    }),
  )
}

export const hebrewLayer: TimelineLayer = {
  id: 'hebrew',
  label: 'Hebrew',
  role: 'structural',
  getPoints: ({
    leadingCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    environment,
  }) =>
    createHebrewStructuralPoints({
      leadingCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      environment,
    }),
  getSpans: ({
    leadingCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    environment,
  }) =>
    createHebrewStructuralSpans({
      leadingCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      environment,
    }),
}
