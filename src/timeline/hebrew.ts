import type { LeadingCalendarSystemId, TimelineLayer } from './layers'
import { positionTimelinePoint, positionTimelineSpan } from './layout'
import {
  SCALE_DAY,
  SCALE_DECADE,
  SCALE_HOUR,
  SCALE_MINUTE,
  SCALE_MONTH,
  SCALE_QUARTER,
  SCALE_WEEK,
  SCALE_YEAR,
  getVisibleTimeRange,
  type ScaleLevel,
} from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan, TimelineSpan } from './types'
import { getCivilDateAtNoonUtc, getHebrewDayInfo, isHebrewQuarterStartMonth } from './hebrewTime'
import { getHebrewTickLabel, renderHebrewStructuralLabelStrategy } from './hebrewLabels'
import { augmentLabelWithPersonalTime } from './personalTime'
import {
  getStructuralExpressionDecision,
  getStructuralSpanOpacity,
  getStructuralTickOpacity,
  isHebrewStructuralLabelStrategy,
  type StructuralExpressionDecision,
  type StructuralExpressionMetadata,
} from './structuralExpressionPolicy'
import {
  formatHebrewIntradayPointLabel,
  getDayViewIntradaySpans,
  getHebrewIntradayDayPoints,
  type HebrewIntradayPointData,
  isNamedHebrewIntradayPoint,
} from './hebrewIntraday'
import {
  HEBREW_PERIOD_FAMILY_IDS,
  getStructuralPeriodFamilyById,
} from './structuralPeriodFamilies'

type HebrewLayerParams = {
  activeLayerIds?: string[]
  leadingCalendarSystemId: LeadingCalendarSystemId
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  environment: Parameters<TimelineLayer['getPoints']>[0]['environment']
}

const HEBREW_ENABLED_SCALES: ScaleLevel[] = [
  SCALE_MINUTE,
  SCALE_HOUR,
  SCALE_DAY,
  SCALE_WEEK,
  SCALE_MONTH,
  SCALE_QUARTER,
  SCALE_YEAR,
  SCALE_DECADE,
]
const PERSONAL_LAYER_ID = 'birthday'

type HebrewBoundaryEvent = {
  timeMs: number
  dayInfo: ReturnType<typeof getHebrewDayInfo>
}

type HebrewBoundaryFamilyEmitter = {
  familyId: string
  matches: (dayInfo: ReturnType<typeof getHebrewDayInfo>) => boolean
}

type HebrewSpanSeed = {
  span: TimelineSpan
  stripeClass: string
}

type HebrewTickPolicyEvaluation = {
  familyId: string
  decision: StructuralExpressionDecision
}

const getHebrewStructuralMetadata = (
  familyId: string,
): StructuralExpressionMetadata => {
  const family = getHebrewPeriodFamily(familyId)

  return {
    structuralPeriodFamilyId: familyId,
    structuralCalendarSystemId: 'hebrew',
    structuralSignificance: family?.significance,
  }
}

const getHebrewPeriodFamily = (familyId: string) => {
  const family = getStructuralPeriodFamilyById(familyId)

  if (!family) {
    throw new Error(`Missing Hebrew structural family definition for "${familyId}"`)
  }

  return family
}

const getHebrewIntradayFamilyId = (point: HebrewIntradayPointData) => {
  if (point.source === 'shabbat-ends') {
    return HEBREW_PERIOD_FAMILY_IDS.week
  }

  if (point.source === 'shkiah') {
    return HEBREW_PERIOD_FAMILY_IDS.day
  }

  return HEBREW_PERIOD_FAMILY_IDS.zmanim
}

const getHebrewSpanStripeClass = (
  activeScaleLevel: ScaleLevel,
  startTimeMs: number,
  environment: HebrewLayerParams['environment'],
) => {
  const startDate = new Date(startTimeMs)

  if (activeScaleLevel === SCALE_DAY) {
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

  if (activeScaleLevel === SCALE_WEEK || activeScaleLevel === SCALE_MONTH) {
    return dayInfo.hebrewDate.day % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
  }

  if (activeScaleLevel === SCALE_QUARTER || activeScaleLevel === SCALE_YEAR) {
    return absoluteHebrewMonthIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
  }

  return dayInfo.hebrewDate.year % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
}

const HEBREW_LEAP_POSITIONS = [3, 6, 8, 11, 14, 17, 19]

const HEBREW_BOUNDARY_TICK_EMISSION_PLAN: Partial<Record<ScaleLevel, HebrewBoundaryFamilyEmitter[]>> = {
  [SCALE_WEEK]: [
    { familyId: HEBREW_PERIOD_FAMILY_IDS.day, matches: () => true },
    { familyId: HEBREW_PERIOD_FAMILY_IDS.week, matches: (dayInfo) => dayInfo.hdate.getDay() === 0 },
    { familyId: HEBREW_PERIOD_FAMILY_IDS.month, matches: (dayInfo) => dayInfo.hebrewDate.day === 1 },
  ],
  [SCALE_MONTH]: [
    { familyId: HEBREW_PERIOD_FAMILY_IDS.day, matches: () => true },
    { familyId: HEBREW_PERIOD_FAMILY_IDS.week, matches: (dayInfo) => dayInfo.hdate.getDay() === 0 },
    { familyId: HEBREW_PERIOD_FAMILY_IDS.month, matches: (dayInfo) => dayInfo.hebrewDate.day === 1 },
  ],
  [SCALE_QUARTER]: [
    { familyId: HEBREW_PERIOD_FAMILY_IDS.month, matches: (dayInfo) => dayInfo.hebrewDate.day === 1 },
    {
      familyId: HEBREW_PERIOD_FAMILY_IDS.quarter,
      matches: (dayInfo) => dayInfo.hebrewDate.day === 1 && isHebrewQuarterStartMonth(dayInfo.hebrewDate.month),
    },
  ],
  [SCALE_YEAR]: [
    { familyId: HEBREW_PERIOD_FAMILY_IDS.month, matches: (dayInfo) => dayInfo.hebrewDate.day === 1 },
    {
      familyId: HEBREW_PERIOD_FAMILY_IDS.quarter,
      matches: (dayInfo) => dayInfo.hebrewDate.day === 1 && isHebrewQuarterStartMonth(dayInfo.hebrewDate.month),
    },
    {
      familyId: HEBREW_PERIOD_FAMILY_IDS.year,
      matches: (dayInfo) => dayInfo.hebrewDate.day === 1 && dayInfo.hebrewDate.month === 7,
    },
  ],
  [SCALE_DECADE]: [
    {
      familyId: HEBREW_PERIOD_FAMILY_IDS.year,
      matches: (dayInfo) => dayInfo.hebrewDate.day === 1 && dayInfo.hebrewDate.month === 7,
    },
    {
      familyId: HEBREW_PERIOD_FAMILY_IDS.shmita,
      matches: (dayInfo) =>
        dayInfo.hebrewDate.day === 1
        && dayInfo.hebrewDate.month === 7
        && dayInfo.hebrewDate.year % 7 === 1,
    },
  ],
}

type HebrewSpanEmissionPlan = {
  familyId: string
  collectSpanSeeds: (
    focusTimeMs: number,
    visibleDurationMs: number,
    environment: HebrewLayerParams['environment'],
  ) => HebrewSpanSeed[]
}

const getLeapYearsBeforeHebrewYear = (year: number) => {
  const priorYears = year - 1
  const fullCycles = Math.floor(priorYears / 19)
  const cycleRemainder = priorYears % 19

  return fullCycles * HEBREW_LEAP_POSITIONS.length
    + HEBREW_LEAP_POSITIONS.filter((position) => position <= cycleRemainder).length
}

const createHebrewBoundarySpansForFamily = (
  activeScaleLevel: ScaleLevel,
  familyId: string,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: HebrewLayerParams['environment'],
): HebrewSpanSeed[] => {
  const spanEmitters = (HEBREW_BOUNDARY_TICK_EMISSION_PLAN[activeScaleLevel] ?? [])
    .filter((emitter) => emitter.familyId === familyId)

  if (spanEmitters.length === 0) {
    return []
  }

  const boundaries = collectHebrewBoundaryEvents(focusTimeMs, visibleDurationMs, environment)
    .filter(({ dayInfo }) => spanEmitters.some((emitter) => emitter.matches(dayInfo)))

  const spans: HebrewSpanSeed[] = []

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]
    const end = boundaries[i + 1]

    if (end.timeMs <= start.timeMs) {
      continue
    }

    spans.push({
      span: {
        id: `hebrew-span-${familyId}-${start.timeMs}`,
        kind: 'structural-period',
        startTimeMs: start.timeMs,
        endTimeMs: end.timeMs,
        label: getHebrewTickLabel(
          activeScaleLevel,
          start.dayInfo,
          start.timeMs,
          true,
        ) ?? '',
        structuralMetadata: getHebrewStructuralMetadata(familyId),
      },
      stripeClass: getHebrewSpanStripeClass(activeScaleLevel, start.timeMs, environment),
    })
  }

  return spans
}

const HEBREW_SPAN_EMISSION_PLAN: Record<ScaleLevel, HebrewSpanEmissionPlan> = {
  [SCALE_MINUTE]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.zmanim,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      getDayViewIntradaySpans(focusTimeMs, visibleDurationMs, environment).map(({ span, stripeClass }) => ({
        span: {
          ...span,
          structuralMetadata: getHebrewStructuralMetadata(HEBREW_PERIOD_FAMILY_IDS.zmanim),
        },
        stripeClass,
      })),
  },
  [SCALE_HOUR]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.zmanim,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      getDayViewIntradaySpans(focusTimeMs, visibleDurationMs, environment).map(({ span, stripeClass }) => ({
        span: {
          ...span,
          structuralMetadata: getHebrewStructuralMetadata(HEBREW_PERIOD_FAMILY_IDS.zmanim),
        },
        stripeClass,
      })),
  },
  [SCALE_DAY]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.zmanim,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      getDayViewIntradaySpans(focusTimeMs, visibleDurationMs, environment).map(({ span, stripeClass }) => ({
        span: {
          ...span,
          structuralMetadata: getHebrewStructuralMetadata(HEBREW_PERIOD_FAMILY_IDS.zmanim),
        },
        stripeClass,
      })),
  },
  [SCALE_WEEK]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.day,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      createHebrewBoundarySpansForFamily(SCALE_WEEK, HEBREW_PERIOD_FAMILY_IDS.day, focusTimeMs, visibleDurationMs, environment),
  },
  [SCALE_MONTH]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.day,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      createHebrewBoundarySpansForFamily(SCALE_MONTH, HEBREW_PERIOD_FAMILY_IDS.day, focusTimeMs, visibleDurationMs, environment),
  },
  [SCALE_QUARTER]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.month,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      createHebrewBoundarySpansForFamily(SCALE_QUARTER, HEBREW_PERIOD_FAMILY_IDS.month, focusTimeMs, visibleDurationMs, environment),
  },
  [SCALE_YEAR]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.month,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      createHebrewBoundarySpansForFamily(SCALE_YEAR, HEBREW_PERIOD_FAMILY_IDS.month, focusTimeMs, visibleDurationMs, environment),
  },
  [SCALE_DECADE]: {
    familyId: HEBREW_PERIOD_FAMILY_IDS.year,
    collectSpanSeeds: (focusTimeMs, visibleDurationMs, environment) =>
      createHebrewBoundarySpansForFamily(SCALE_DECADE, HEBREW_PERIOD_FAMILY_IDS.year, focusTimeMs, visibleDurationMs, environment),
  },
}

const getHebrewPolicyAwareTickLabel = (
  decision: StructuralExpressionDecision,
  activeScaleLevel: ScaleLevel,
  dayInfo: ReturnType<typeof getHebrewDayInfo>,
  boundaryTimeMs: number,
  isLeading: boolean,
  intradayPoint?: HebrewIntradayPointData,
  intradayLabel?: string,
) => {
  if (decision.labelStrategy && isHebrewStructuralLabelStrategy(decision.labelStrategy)) {
    return renderHebrewStructuralLabelStrategy(
      decision.labelStrategy,
      dayInfo,
      boundaryTimeMs,
      isLeading,
      intradayPoint,
      intradayLabel,
    )
  }

  return getHebrewTickLabel(
    activeScaleLevel,
    dayInfo,
    boundaryTimeMs,
    isLeading,
  ) ?? ''
}

const getHebrewPolicyAwareTickRankClass = (
  decision: StructuralExpressionDecision,
) => decision.tickRankClass ?? 'tick-rank-ordinary'

const getHebrewTickPolicyEvaluationForFamily = (
  familyId: string,
  activeScaleLevel: ScaleLevel,
  visibleDurationMs: number,
  leadingCalendarSystemId: LeadingCalendarSystemId,
  environment: HebrewLayerParams['environment'],
): HebrewTickPolicyEvaluation => {
  const family = getHebrewPeriodFamily(familyId)
  return {
    familyId,
    decision: getStructuralExpressionDecision(family, {
      activeScaleLevel,
      visibleDurationMs,
      leadingCalendarSystemId,
      environment,
    }),
  }
}

const createHebrewPositionedTickPoint = ({
  activeScaleLevel,
  decision,
  familyId,
  focusTimeMs,
  label,
  leadingCalendarSystemId,
  timeMs,
  visibleDurationMs,
}: {
  activeScaleLevel: ScaleLevel
  decision: StructuralExpressionDecision
  familyId: string
  focusTimeMs: number
  label: string | undefined
  leadingCalendarSystemId: LeadingCalendarSystemId
  timeMs: number
  visibleDurationMs: number
}): PositionedTimelinePoint => positionTimelinePoint(
  {
    id: `hebrew-${familyId}-${timeMs}`,
    kind: 'tick',
    timeMs,
    structuralMetadata: getHebrewStructuralMetadata(familyId),
    label: label ?? '',
  },
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  new Date(timeMs),
  {
    opacity: getStructuralTickOpacity(decision),
    className: [
      leadingCalendarSystemId === 'hebrew'
        ? 'structural-tick-leading'
        : 'structural-tick-supporting',
      'hebrew-tick',
      getHebrewPolicyAwareTickRankClass(decision),
    ].join(' '),
    labelClassName: leadingCalendarSystemId === 'hebrew'
      ? 'hebrew-label structural-label-leading'
      : 'hebrew-label structural-label-supporting',
  },
)

const collectHebrewBoundaryEvents = (
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: HebrewLayerParams['environment'],
): HebrewBoundaryEvent[] => {
  const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStart = startTimeMs - visibleDurationMs * 0.5
  const bufferedEnd = endTimeMs + visibleDurationMs * 0.5
  const boundaries: HebrewBoundaryEvent[] = []

  let civilDate = getCivilDateAtNoonUtc(new Date(bufferedStart))
  civilDate.setUTCDate(civilDate.getUTCDate() - 1)

  while (civilDate.getTime() <= bufferedEnd + 24 * 60 * 60 * 1000) {
    const noonTimestamp = new Date(civilDate)
    const hebrewDayInfo = getHebrewDayInfo(noonTimestamp, environment)
    const boundaryTimeMs = hebrewDayInfo.startsAtSunset.getTime()

    if (
      boundaryTimeMs >= bufferedStart &&
      boundaryTimeMs <= bufferedEnd
    ) {
      boundaries.push({
        timeMs: boundaryTimeMs,
        dayInfo: hebrewDayInfo,
      })
    }

    civilDate.setUTCDate(civilDate.getUTCDate() + 1)
  }

  return boundaries
}

const resolveHebrewBoundaryFamilyId = (
  activeScaleLevel: ScaleLevel,
  dayInfo: ReturnType<typeof getHebrewDayInfo>,
) => {
  const emitters = HEBREW_BOUNDARY_TICK_EMISSION_PLAN[activeScaleLevel] ?? []

  for (let i = emitters.length - 1; i >= 0; i -= 1) {
    if (emitters[i].matches(dayInfo)) {
      return emitters[i].familyId
    }
  }

  return null
}

export const createHebrewStructuralPoints = ({
  activeLayerIds,
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  environment,
}: HebrewLayerParams): PositionedTimelinePoint[] => {
  const points: PositionedTimelinePoint[] = []
  const boundaries = activeScaleLevel === SCALE_MINUTE || activeScaleLevel === SCALE_HOUR || activeScaleLevel === SCALE_DAY
    ? []
    : collectHebrewBoundaryEvents(focusTimeMs, visibleDurationMs, environment)

  boundaries.forEach(({ timeMs, dayInfo }) => {
    const isLeading = leadingCalendarSystemId === 'hebrew'
    const familyId = resolveHebrewBoundaryFamilyId(activeScaleLevel, dayInfo)

    if (!familyId) {
      return
    }

    const { decision } = getHebrewTickPolicyEvaluationForFamily(
      familyId,
      activeScaleLevel,
      visibleDurationMs,
      leadingCalendarSystemId,
      environment,
    )

    if (decision.tickState === 'hidden') {
      return
    }

    const rawLabel = getHebrewPolicyAwareTickLabel(
      decision,
      activeScaleLevel,
      dayInfo,
      timeMs,
      isLeading,
    )
    points.push(
      createHebrewPositionedTickPoint({
        activeScaleLevel,
        decision,
        familyId,
        focusTimeMs,
        label: !decision.showLabel
          ? ''
          : activeLayerIds?.includes(PERSONAL_LAYER_ID) && activeScaleLevel <= SCALE_MONTH
          ? augmentLabelWithPersonalTime({
              label: rawLabel,
              timeMs,
              environment,
              isLeading,
              includeDayOfLife: true,
              includeWeekOfLife: false,
            })
          : rawLabel,
        leadingCalendarSystemId,
        timeMs,
        visibleDurationMs,
        }),
    )
  })

  if (activeScaleLevel === SCALE_MINUTE || activeScaleLevel === SCALE_HOUR || activeScaleLevel === SCALE_DAY) {
    getHebrewIntradayDayPoints(focusTimeMs, visibleDurationMs, environment)
      .filter(isNamedHebrewIntradayPoint)
      .forEach((point) => {
      const isLeading = leadingCalendarSystemId === 'hebrew'
      const familyId = getHebrewIntradayFamilyId(point)
      const { decision } = getHebrewTickPolicyEvaluationForFamily(
        familyId,
        activeScaleLevel,
        visibleDurationMs,
        leadingCalendarSystemId,
        environment,
      )

      if (decision.tickState === 'hidden') {
        return
      }

      const rawLabel = formatHebrewIntradayPointLabel(
        point,
        isLeading,
        environment,
      )
      const label = !decision.showLabel
        ? ''
        : getHebrewPolicyAwareTickLabel(
            decision,
            activeScaleLevel,
            getHebrewDayInfo(new Date(point.timeMs), environment),
            point.timeMs,
            isLeading,
            point,
            rawLabel,
          )
      points.push(
        createHebrewPositionedTickPoint({
          activeScaleLevel,
          decision,
          familyId,
          focusTimeMs,
          label: activeLayerIds?.includes(PERSONAL_LAYER_ID) && point.source === 'shkiah'
            ? augmentLabelWithPersonalTime({
                label,
                timeMs: point.timeMs,
                environment,
                isLeading,
                includeDayOfLife: true,
                includeWeekOfLife: false,
              })
            : label,
          leadingCalendarSystemId,
          timeMs: point.timeMs,
          visibleDurationMs,
        }),
      )
      })
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

  const spanPlan = HEBREW_SPAN_EMISSION_PLAN[activeScaleLevel]
  const family = getHebrewPeriodFamily(spanPlan.familyId)
  const decision = getStructuralExpressionDecision(family, {
    activeScaleLevel,
    visibleDurationMs,
    leadingCalendarSystemId,
    environment,
  })

  if (decision.spanState === 'hidden') {
    return []
  }

  return spanPlan.collectSpanSeeds(
    focusTimeMs,
    visibleDurationMs,
    environment,
  ).map(({ span, stripeClass }) =>
    positionTimelineSpan(span, focusTimeMs, visibleDurationMs, {
      opacity: getStructuralSpanOpacity(decision),
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
