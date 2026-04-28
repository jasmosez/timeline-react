import { SCALE_LEVEL_CONFIG, getVisibleRangeStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { LeadingCalendarSystemId, TimelineEnvironment, TimelineLayer } from './layers'
import { renderGregorianStructuralLabelStrategy } from './gregorianLabels'
import { augmentLabelWithPersonalTime } from './personalTime'
import {
  createStructuralExpressionDecision,
  getStructuralExpressionDecision,
  getStructuralSpanOpacity,
  getStructuralTickInstanceDecision,
  getStructuralTickOpacity,
  isGregorianStructuralLabelStrategy,
  type StructuralExpressionDecision,
  type StructuralExpressionMetadata,
} from './structuralExpressionPolicy'
import {
  GREGORIAN_PERIOD_FAMILY_IDS,
  getStructuralPeriodFamilyById,
} from './structuralPeriodFamilies'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  activeLayerIds?: string[]
  environment: Parameters<TimelineLayer['getPoints']>[0]['environment']
  leadingCalendarSystemId: LeadingCalendarSystemId
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
}

type GregorianTickPolicyEvaluation = {
  familyId: string
  decision: StructuralExpressionDecision
}

type GregorianStructuralTickLabelParams = {
  activeScaleLevel: ScaleLevel
  tickTime: number
  leadingCalendarSystemId?: LeadingCalendarSystemId
  visibleDurationMs?: number
  environment?: TimelineEnvironment
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

const getGregorianSpanStripeClass = (scaleLevel: ScaleLevel, startTimeMs: number) => {
  const startDate = new Date(startTimeMs)
  let stripeIndex = 0

  switch (scaleLevel) {
    case -1:
      stripeIndex = Math.floor(startTimeMs / 1000)
      break
    case 0:
      stripeIndex = Math.floor(startTimeMs / (60 * 1000))
      break
    case 1:
      stripeIndex = Math.floor(startTimeMs / (60 * 60 * 1000))
      break
    case 2:
    case 3:
      stripeIndex = Math.floor(Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / DAY_IN_MS)
      break
    case 4:
      stripeIndex = Math.floor(Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / (7 * DAY_IN_MS))
      break
    case 5:
      stripeIndex = startDate.getFullYear() * 12 + startDate.getMonth()
      break
    case 6:
      stripeIndex = startDate.getFullYear()
      break
    default:
      stripeIndex = Math.floor(startTimeMs / DAY_IN_MS)
  }

  return stripeIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
}

const getGregorianTickRankClass = (scaleLevel: ScaleLevel, tickTime: number) => {
  const tickDate = new Date(tickTime)

  switch (scaleLevel) {
    case -1:
      if (tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getSeconds() === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 6:
      if (tickDate.getFullYear() % 10 === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getFullYear() % 5 === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    default:
      return 'tick-rank-ordinary'
  }
}

const getGregorianPolicyAwareTickRankClass = (
  decision: StructuralExpressionDecision,
  scaleLevel: ScaleLevel,
  tickTime: number,
) => {
  if (decision.tickRankClass) {
    return decision.tickRankClass
  }

  return getGregorianTickRankClass(scaleLevel, tickTime)
}

const DEFAULT_GREGORIAN_POLICY_ENVIRONMENT: TimelineEnvironment = {
  now: new Date('2026-01-01T12:00:00-05:00'),
  birthDate: new Date('1982-04-19T02:25:00-05:00'),
  timezone: 'America/New_York',
  location: {
    city: 'Northampton',
    region: 'MA',
    postalCode: '01060',
    latitude: 42.3251,
    longitude: -72.6412,
  },
}

const createTickPoint = (tickTime: number): TimelinePoint => ({
  id: `tick-${tickTime}`,
  kind: 'tick',
  timeMs: tickTime,
})

const getGregorianPointFamilyId = (scaleLevel: ScaleLevel, tickTime: number) => {
  const tickDate = new Date(tickTime)

  switch (scaleLevel) {
    case -1:
      if (tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.day
      }
      if (tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.hour
      }
      if (tickDate.getSeconds() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.minute
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.second
    case 0:
      if (tickDate.getHours() === 0 && tickDate.getMinutes() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.day
      }
      if (tickDate.getMinutes() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.hour
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.minute
    case 1:
      if (tickDate.getHours() === 0 && tickDate.getDay() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.week
      }
      if (tickDate.getHours() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.day
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.hour
    case 2:
      if (tickDate.getDate() === 1) {
        return GREGORIAN_PERIOD_FAMILY_IDS.month
      }
      if (tickDate.getDay() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.week
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.day
    case 3:
      if (tickDate.getDate() === 1 && tickDate.getMonth() % 3 === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.quarter
      }
      if (tickDate.getDate() === 1) {
        return GREGORIAN_PERIOD_FAMILY_IDS.month
      }
      if (tickDate.getDay() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.week
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.day
    case 4:
      if (tickDate.getDate() === 1 && tickDate.getMonth() % 3 === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.quarter
      }
      if (tickDate.getDate() === 1) {
        return GREGORIAN_PERIOD_FAMILY_IDS.month
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.week
    case 5:
      if (tickDate.getMonth() === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.year
      }
      if (tickDate.getMonth() % 3 === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.quarter
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.month
    case 6:
      if (tickDate.getFullYear() % 10 === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.decade
      }
      if (tickDate.getFullYear() % 5 === 0) {
        return GREGORIAN_PERIOD_FAMILY_IDS.year
      }
      return GREGORIAN_PERIOD_FAMILY_IDS.year
    default:
      return GREGORIAN_PERIOD_FAMILY_IDS.day
  }
}

const getGregorianSpanFamilyId = (scaleLevel: ScaleLevel) => {
  switch (scaleLevel) {
    case -1:
      return GREGORIAN_PERIOD_FAMILY_IDS.second
    case 0:
      return GREGORIAN_PERIOD_FAMILY_IDS.minute
    case 1:
      return GREGORIAN_PERIOD_FAMILY_IDS.hour
    case 2:
    case 3:
      return GREGORIAN_PERIOD_FAMILY_IDS.day
    case 4:
      return GREGORIAN_PERIOD_FAMILY_IDS.week
    case 5:
      return GREGORIAN_PERIOD_FAMILY_IDS.month
    case 6:
      return GREGORIAN_PERIOD_FAMILY_IDS.year
    default:
      return GREGORIAN_PERIOD_FAMILY_IDS.day
  }
}

const getGregorianStructuralMetadata = (
  familyId: string,
): StructuralExpressionMetadata => {
  const family = getStructuralPeriodFamilyById(familyId)

  return {
    structuralPeriodFamilyId: familyId,
    structuralCalendarSystemId: 'gregorian',
    structuralSignificance: family?.significance,
  }
}

const PERSONAL_LAYER_ID = 'birthday'

const getRegularTickPersonalCounterKinds = (scaleLevel: ScaleLevel, tickTime: number) => {
  const tickDate = new Date(tickTime)

  switch (scaleLevel) {
    case -1:
    case 0:
      return {
        includeDayOfLife: tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0,
        includeWeekOfLife: false,
      }
    case 1:
      return {
        includeDayOfLife: tickDate.getHours() === 0 && tickDate.getMinutes() === 0,
        includeWeekOfLife: tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getDay() === 0,
      }
    case 2:
    case 3:
      return {
        includeDayOfLife: true,
        includeWeekOfLife: tickDate.getDay() === 0,
      }
    case 4:
      return {
        includeDayOfLife: false,
        includeWeekOfLife: true,
      }
    default:
      return {
        includeDayOfLife: false,
        includeWeekOfLife: false,
      }
  }
}

const getQuarterBoundaryPersonalCounterKinds = (tickTime: number) => ({
  includeDayOfLife: false,
  includeWeekOfLife: new Date(tickTime).getDay() === 0,
})

const getGregorianFamilyPrecedence = (
  scaleLevel: ScaleLevel,
  familyId: string,
) => {
  if (scaleLevel === 4) {
    switch (familyId) {
      case GREGORIAN_PERIOD_FAMILY_IDS.week:
        return 0
      case GREGORIAN_PERIOD_FAMILY_IDS.month:
        return 1
      case GREGORIAN_PERIOD_FAMILY_IDS.quarter:
        return 2
      default:
        return -1
    }
  }

  if (scaleLevel === 5) {
    switch (familyId) {
      case GREGORIAN_PERIOD_FAMILY_IDS.month:
        return 0
      case GREGORIAN_PERIOD_FAMILY_IDS.quarter:
        return 1
      case GREGORIAN_PERIOD_FAMILY_IDS.year:
        return 2
      default:
        return -1
    }
  }

  return -1
}

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate.getTime()
}

const startOfMonth = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(1)
  return nextDate
}

const getBufferedVisibleRange = (focusTimeMs: number, visibleDurationMs: number) => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)

  return {
    bufferedStartMs: bufferedRange.startTimeMs - visibleDurationMs * 0.5,
    bufferedEndMs: bufferedRange.endTimeMs + visibleDurationMs * 0.5,
  }
}

const getGregorianPolicyAwareTickLabel = (
  decision: StructuralExpressionDecision,
  tickTime: number,
  isLeading: boolean,
) => {
  if (decision.labelStrategy && isGregorianStructuralLabelStrategy(decision.labelStrategy)) {
    return renderGregorianStructuralLabelStrategy(decision.labelStrategy, tickTime, isLeading)
  }

  return ''
}

const getGregorianTickPolicyEvaluation = (
  scaleLevel: ScaleLevel,
  tickTime: number,
  visibleDurationMs: number,
  leadingCalendarSystemId: LeadingCalendarSystemId,
  environment: TickCollectionParams['environment'],
): GregorianTickPolicyEvaluation => {
  const familyId = getGregorianPointFamilyId(scaleLevel, tickTime)
  const family = getStructuralPeriodFamilyById(familyId)
  const baseDecision = family
    ? getStructuralExpressionDecision(family, {
        activeScaleLevel: scaleLevel,
        visibleDurationMs,
        leadingCalendarSystemId,
        environment,
      })
    : createStructuralExpressionDecision()

  const decision = family && (
    scaleLevel === -1
    || (scaleLevel === 0 && family.kind === 'minute')
    || (scaleLevel === 1 && family.kind === 'hour')
  )
    ? getStructuralTickInstanceDecision(family, tickTime, baseDecision)
    : baseDecision

  return { familyId, decision }
}

export const getGregorianStructuralTickLabelFromPolicy = ({
  activeScaleLevel,
  tickTime,
  leadingCalendarSystemId = 'gregorian',
  visibleDurationMs = SCALE_LEVEL_CONFIG[activeScaleLevel].screenSpan,
  environment = DEFAULT_GREGORIAN_POLICY_ENVIRONMENT,
}: GregorianStructuralTickLabelParams) => {
  const { decision } = getGregorianTickPolicyEvaluation(
    activeScaleLevel,
    tickTime,
    visibleDurationMs,
    leadingCalendarSystemId,
    environment,
  )

  if (!decision.showLabel) {
    return ''
  }

  return getGregorianPolicyAwareTickLabel(
    decision,
    tickTime,
    leadingCalendarSystemId === 'gregorian',
  )
}

const createGregorianPositionedTickPoint = (
  familyId: string,
  decision: StructuralExpressionDecision,
  scaleLevel: ScaleLevel,
  tickTime: number,
  activeLayerIds: string[] | undefined,
  environment: TickCollectionParams['environment'],
  leadingCalendarSystemId: LeadingCalendarSystemId,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const isLeading = leadingCalendarSystemId === 'gregorian'
  const rawLabel = getGregorianPolicyAwareTickLabel(
    decision,
    tickTime,
    isLeading,
  )

  const point = {
    ...createTickPoint(tickTime),
    structuralMetadata: getGregorianStructuralMetadata(familyId),
    label: !decision.showLabel
      ? ''
      : activeLayerIds?.includes(PERSONAL_LAYER_ID)
      ? augmentLabelWithPersonalTime({
          label: rawLabel,
          timeMs: tickTime,
          environment,
          isLeading,
          ...(scaleLevel === 4 || (scaleLevel === 5 && familyId === GREGORIAN_PERIOD_FAMILY_IDS.quarter)
            ? getQuarterBoundaryPersonalCounterKinds(tickTime)
            : getRegularTickPersonalCounterKinds(scaleLevel, tickTime)),
        })
      : rawLabel,
  }

  return positionTimelinePoint(
    point,
    scaleLevel,
    focusTimeMs,
    visibleDurationMs,
    getVisibleRangeStartTickDate(scaleLevel, focusTimeMs, visibleDurationMs),
    {
      opacity: getStructuralTickOpacity(decision),
      className: [
        leadingCalendarSystemId === 'gregorian'
          ? 'structural-tick-leading'
          : 'structural-tick-supporting',
        getGregorianPolicyAwareTickRankClass(decision, scaleLevel, tickTime),
      ].join(' '),
      labelClassName: leadingCalendarSystemId === 'gregorian'
        ? 'structural-label-leading'
        : 'structural-label-supporting',
    },
  )
}

const addPositionedTicksForScaleLevel = (
  points: Map<number, PositionedTimelinePoint>,
  activeLayerIds: string[] | undefined,
  environment: TickCollectionParams['environment'],
  leadingCalendarSystemId: LeadingCalendarSystemId,
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  const visibleRangeStartTickDate = getVisibleRangeStartTickDate(scaleLevel, focusTimeMs, visibleDurationMs)
  let tickTime = SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const isLeading = leadingCalendarSystemId === 'gregorian'
    const { familyId, decision } = getGregorianTickPolicyEvaluation(
      scaleLevel,
      tickTime,
      visibleDurationMs,
      leadingCalendarSystemId,
      environment,
    )

    if (decision.tickState === 'hidden') {
      tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
      continue
    }

    const rawLabel = getGregorianPolicyAwareTickLabel(
      decision,
      tickTime,
      isLeading,
    )
    const point = {
      ...createTickPoint(tickTime),
      structuralMetadata: getGregorianStructuralMetadata(familyId),
      label: !decision.showLabel
        ? ''
        : activeLayerIds?.includes(PERSONAL_LAYER_ID)
        ? augmentLabelWithPersonalTime({
            label: rawLabel,
            timeMs: tickTime,
            environment,
            isLeading,
            ...getRegularTickPersonalCounterKinds(scaleLevel, tickTime),
          })
        : rawLabel,
    }

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        scaleLevel,
        focusTimeMs,
        visibleDurationMs,
        visibleRangeStartTickDate,
        {
          opacity: getStructuralTickOpacity(decision),
          className: [
            leadingCalendarSystemId === 'gregorian'
              ? 'structural-tick-leading'
              : 'structural-tick-supporting',
            getGregorianPolicyAwareTickRankClass(decision, scaleLevel, tickTime),
          ].join(' '),
          labelClassName: leadingCalendarSystemId === 'gregorian'
            ? 'structural-label-leading'
            : 'structural-label-supporting',
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

const addGregorianMultiFamilyTicksForScale = (
  points: Map<number, PositionedTimelinePoint>,
  activeLayerIds: string[] | undefined,
  environment: TickCollectionParams['environment'],
  leadingCalendarSystemId: LeadingCalendarSystemId,
  scaleLevel: 4 | 5,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { bufferedStartMs, bufferedEndMs } = getBufferedVisibleRange(focusTimeMs, visibleDurationMs)
  const proposals = new Map<number, { familyId: string, decision: StructuralExpressionDecision }>()

  if (scaleLevel === 4) {
    let tickTime = SCALE_LEVEL_CONFIG[4].startTickDateFunc(new Date(bufferedStartMs)).getTime()

    while (tickTime <= bufferedEndMs) {
      const family = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.week)
      const decision = family
        ? getStructuralExpressionDecision(family, {
            activeScaleLevel: 4,
            visibleDurationMs,
            leadingCalendarSystemId,
            environment,
          })
        : createStructuralExpressionDecision()

      if (decision.tickState !== 'hidden') {
        proposals.set(tickTime, {
          familyId: GREGORIAN_PERIOD_FAMILY_IDS.week,
          decision,
        })
      }

      tickTime = SCALE_LEVEL_CONFIG[4].calculateTickTimeFunc(new Date(tickTime), 1)
    }
  }

  let monthTickTime = startOfMonth(new Date(bufferedStartMs)).getTime()

  while (monthTickTime <= bufferedEndMs) {
    const tickDate = new Date(monthTickTime)
    const candidateFamilyIds = scaleLevel === 4
      ? [
          GREGORIAN_PERIOD_FAMILY_IDS.month,
          ...(tickDate.getMonth() % 3 === 0 ? [GREGORIAN_PERIOD_FAMILY_IDS.quarter] : []),
        ]
      : [
          GREGORIAN_PERIOD_FAMILY_IDS.month,
          ...(tickDate.getMonth() % 3 === 0 ? [GREGORIAN_PERIOD_FAMILY_IDS.quarter] : []),
          ...(tickDate.getMonth() === 0 ? [GREGORIAN_PERIOD_FAMILY_IDS.year] : []),
        ]

    candidateFamilyIds.forEach((familyId) => {
      const resolvedFamily = getStructuralPeriodFamilyById(familyId)
      const decision = resolvedFamily
        ? getStructuralExpressionDecision(resolvedFamily, {
            activeScaleLevel: scaleLevel,
            visibleDurationMs,
            leadingCalendarSystemId,
            environment,
          })
        : createStructuralExpressionDecision()

      if (decision.tickState === 'hidden') {
        return
      }

      const existing = proposals.get(monthTickTime)
      const candidate = {
        familyId,
        decision,
      }

      if (!existing || getGregorianFamilyPrecedence(scaleLevel, familyId) > getGregorianFamilyPrecedence(scaleLevel, existing.familyId)) {
        proposals.set(monthTickTime, candidate)
      }
    })

    monthTickTime = addMonths(tickDate, 1)
  }

  proposals.forEach(({ familyId, decision }, tickTime) => {
    points.set(
      tickTime,
      createGregorianPositionedTickPoint(
        familyId,
        decision,
        scaleLevel,
        tickTime,
        activeLayerIds,
        environment,
        leadingCalendarSystemId,
        focusTimeMs,
        visibleDurationMs,
      ),
    )
  })
}

export const createGregorianTickPoints = ({
  activeLayerIds,
  environment,
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  if (activeScaleLevel === 4 || activeScaleLevel === 5) {
    addGregorianMultiFamilyTicksForScale(
      points,
      activeLayerIds,
      environment,
      leadingCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
    )
  } else {
    addPositionedTicksForScaleLevel(
      points,
      activeLayerIds,
      environment,
      leadingCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
    )
  }

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  leadingCalendarSystemId: LeadingCalendarSystemId,
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TickCollectionParams['environment'],
): PositionedTimelineSpan[] => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  const familyId = getGregorianSpanFamilyId(activeScaleLevel)
  const family = getStructuralPeriodFamilyById(familyId)
  const decision = family
    ? getStructuralExpressionDecision(family, {
        activeScaleLevel,
        visibleDurationMs,
        leadingCalendarSystemId,
        environment,
      })
    : createStructuralExpressionDecision()

  if (decision.spanState === 'hidden') {
    return []
  }

  return createStructuralSpansForRange(activeScaleLevel, bufferedStartMs, bufferedEndMs).map((span) =>
    positionTimelineSpan(
      {
        ...span,
        structuralMetadata: getGregorianStructuralMetadata(familyId),
      },
      focusTimeMs,
      visibleDurationMs,
      {
        opacity: getStructuralSpanOpacity(decision),
        className: [
          leadingCalendarSystemId === 'gregorian'
            ? 'structural-span structural-span-leading'
            : 'structural-span structural-span-supporting',
          getGregorianSpanStripeClass(activeScaleLevel, span.startTimeMs),
        ].join(' '),
        side: leadingCalendarSystemId === 'gregorian' ? 'leading' : 'supporting',
        labelTheme: 'default',
      },
    ),
  )
}

export const gregorianLayer: TimelineLayer = {
  id: 'gregorian',
  label: 'Gregorian',
  role: 'structural',
  getPoints: createGregorianTickPoints,
  getSpans: ({ leadingCalendarSystemId, activeScaleLevel, focusTimeMs, visibleDurationMs, environment }) =>
    createGregorianStructuralSpans(
      leadingCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      environment,
    ),
}
