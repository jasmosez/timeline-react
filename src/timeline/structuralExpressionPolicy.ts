import {
  SCALE_DAY,
  SCALE_DECADE,
  SCALE_HOUR,
  SCALE_MINUTE,
  SCALE_MONTH,
  SCALE_QUARTER,
  SCALE_WEEK,
  SCALE_YEAR,
  type ScaleLevel,
} from './scales'
import type { LeadingCalendarSystemId, TimelineEnvironment } from './layers'

export type StructuralCalendarSystemId = 'gregorian' | 'hebrew' | 'life-relative'

export type StructuralExpressionTickState =
  | 'hidden'
  | 'visible-faint'
  | 'visible-unlabeled'
  | 'visible-labeled'
  | 'emphasized'

export type StructuralExpressionSpanState =
  | 'hidden'
  | 'visible-faint'
  | 'visible'
  | 'emphasized'

export type StructuralExpressionContextState =
  | 'none'
  | 'sticky-context-bearing'
  | 'promoted-label-bearing'

export type StructuralExpressionSignificance =
  | 'local'
  | 'intermediate'
  | 'major'
  | 'macro'

export type StructuralPeriodFamilyDefinition = {
  id: string
  calendarSystemId: StructuralCalendarSystemId
  kind: string
  significance: StructuralExpressionSignificance
  supportsBoundaryExpression: boolean
  supportsIntervalExpression: boolean
  supportsLabels?: boolean
  supportsStickyContext?: boolean
  notes?: string
}

export type StructuralExpressionPolicyInput = {
  activeScaleLevel: ScaleLevel
  visibleDurationMs: number
  leadingCalendarSystemId: LeadingCalendarSystemId
  environment: TimelineEnvironment
}

export type GregorianStructuralLabelStrategy =
  | 'minute-five-second'
  | 'minute-top-of-minute'
  | 'minute-top-of-hour'
  | 'minute-midnight-boundary'
  | 'hour-five-minute'
  | 'hour-top-of-hour'
  | 'hour-midnight-boundary'
  | 'weekday-plus-day'
  | 'week-plus-day'
  | 'week-view-contextual'
  | 'month-contextual'
  | 'week-number'
  | 'quarter-boundary-primary'
  | 'quarter-boundary-secondary'
  | 'year-boundary'
  | 'month-in-year'

export type StructuralTickLabelStrategy = GregorianStructuralLabelStrategy

export type StructuralTickRankClass =
  | 'tick-rank-ordinary'
  | 'tick-rank-secondary'
  | 'tick-rank-primary'

export type StructuralExpressionDecision = {
  tickState: StructuralExpressionTickState
  spanState: StructuralExpressionSpanState
  contextState: StructuralExpressionContextState
  prominence: number
  showLabel: boolean
  showSpanLabel: boolean
  labelStrategy?: StructuralTickLabelStrategy
  tickRankClass?: StructuralTickRankClass
}

export type StructuralTickInstanceVariantId =
  | 'default'
  | 'five-second'
  | 'five-minute'

export type StructuralTickInstanceVariant = {
  id: StructuralTickInstanceVariantId
  matches: (tickTimeMs: number) => boolean
  decision: Partial<StructuralExpressionDecision>
}

export type StructuralExpressionMetadata = {
  structuralPeriodFamilyId?: string
  structuralCalendarSystemId?: StructuralCalendarSystemId
  structuralSignificance?: StructuralExpressionSignificance
}

type StructuralFamilyDecisionOverrides = Omit<Partial<StructuralExpressionDecision>, 'labelStrategy'>

type StructuralFamilyPolicy = StructuralFamilyDecisionOverrides & {
  labelStrategy?:
    | StructuralTickLabelStrategy
    | ((input: StructuralExpressionPolicyInput) => StructuralTickLabelStrategy | undefined)
}

type StructuralFamilyPolicyByKind = Partial<Record<string, StructuralFamilyPolicy>>

type StructuralCalendarExpressionDeclaration = {
  activeSpanKindByScale: Partial<Record<ScaleLevel, string>>
  tickPolicyByScale: Partial<Record<ScaleLevel, StructuralFamilyPolicyByKind>>
}

type StructuralFamilyInstanceVarianceDeclaration = Partial<
  Record<string, StructuralTickInstanceVariant[]>
>

export const createStructuralExpressionDecision = (
  overrides: Partial<StructuralExpressionDecision> = {},
): StructuralExpressionDecision => ({
  tickState: 'visible-labeled',
  spanState: 'visible',
  contextState: 'none',
  prominence: 1,
  showLabel: true,
  showSpanLabel: false,
  ...overrides,
})

const GREGORIAN_EXPRESSION_DECLARATION: StructuralCalendarExpressionDeclaration = {
  activeSpanKindByScale: {
    [SCALE_MINUTE]: 'second',
    [SCALE_HOUR]: 'minute',
    [SCALE_DAY]: 'hour',
    [SCALE_WEEK]: 'day',
    [SCALE_MONTH]: 'day',
    [SCALE_QUARTER]: 'week',
    [SCALE_YEAR]: 'month',
    [SCALE_DECADE]: 'year',
  },
  tickPolicyByScale: {
    [SCALE_MINUTE]: {
      second: {
        tickState: 'visible-unlabeled',
        showLabel: false,
        tickRankClass: 'tick-rank-ordinary',
      },
      minute: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'minute-top-of-minute',
        tickRankClass: 'tick-rank-secondary',
      },
      hour: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'minute-top-of-hour',
        tickRankClass: 'tick-rank-secondary',
      },
      day: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'minute-midnight-boundary',
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_HOUR]: {
      minute: {
        tickState: 'visible-unlabeled',
        showLabel: false,
        tickRankClass: 'tick-rank-ordinary',
      },
      hour: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'hour-top-of-hour',
        tickRankClass: 'tick-rank-secondary',
      },
      day: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'hour-midnight-boundary',
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_WEEK]: {
      day: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'weekday-plus-day',
        tickRankClass: 'tick-rank-ordinary',
      },
      week: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'week-plus-day',
        tickRankClass: 'tick-rank-secondary',
      },
      month: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'week-view-contextual',
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_MONTH]: {
      day: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'month-contextual',
        tickRankClass: 'tick-rank-ordinary',
      },
      week: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'month-contextual',
        tickRankClass: 'tick-rank-secondary',
      },
      month: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'month-contextual',
        tickRankClass: 'tick-rank-primary',
      },
      quarter: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'month-contextual',
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_QUARTER]: {
      week: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'week-number',
        tickRankClass: 'tick-rank-ordinary',
      },
      month: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'gregorian'
            ? 'quarter-boundary-primary'
            : 'quarter-boundary-secondary',
        tickRankClass: 'tick-rank-secondary',
      },
      quarter: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'gregorian'
            ? 'quarter-boundary-primary'
            : 'quarter-boundary-secondary',
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_YEAR]: {
      month: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'month-in-year',
        tickRankClass: 'tick-rank-ordinary',
      },
      year: {
        tickState: 'visible-labeled',
        showLabel: true,
        labelStrategy: 'year-boundary',
        tickRankClass: 'tick-rank-primary',
      },
      quarter: {
        tickState: 'visible-unlabeled',
        showLabel: false,
        tickRankClass: 'tick-rank-secondary',
      },
    },
    [SCALE_DECADE]: {
      year: { tickState: 'visible-labeled', showLabel: true },
      decade: { tickState: 'visible-labeled', showLabel: true },
    },
  },
}

const HEBREW_EXPRESSION_DECLARATION: StructuralCalendarExpressionDeclaration = {
  activeSpanKindByScale: {
    [SCALE_MINUTE]: 'zmanim',
    [SCALE_HOUR]: 'zmanim',
    [SCALE_DAY]: 'zmanim',
    [SCALE_WEEK]: 'day',
    [SCALE_MONTH]: 'day',
    [SCALE_QUARTER]: 'month',
    [SCALE_YEAR]: 'month',
    [SCALE_DECADE]: 'year',
  },
  tickPolicyByScale: {
    [SCALE_WEEK]: {
      day: { tickState: 'visible-labeled', showLabel: true },
      week: { tickState: 'visible-labeled', showLabel: true },
      month: { tickState: 'visible-labeled', showLabel: true },
    },
    [SCALE_MONTH]: {
      day: { tickState: 'visible-labeled', showLabel: true },
      week: { tickState: 'visible-labeled', showLabel: true },
      month: { tickState: 'visible-labeled', showLabel: true },
      quarter: { tickState: 'visible-labeled', showLabel: true },
    },
    [SCALE_QUARTER]: {
      month: { tickState: 'visible-labeled', showLabel: true },
      quarter: { tickState: 'visible-labeled', showLabel: true },
    },
    [SCALE_YEAR]: {
      month: { tickState: 'visible-labeled', showLabel: true },
      year: { tickState: 'visible-labeled', showLabel: true },
      quarter: { tickState: 'visible-unlabeled', showLabel: false },
    },
    [SCALE_DECADE]: {
      year: { tickState: 'visible-labeled', showLabel: true },
      shmita: { tickState: 'visible-labeled', showLabel: true },
    },
  },
}

const GREGORIAN_SECOND_INSTANCE_VARIANTS: StructuralTickInstanceVariant[] = [
  {
    id: 'five-second',
    matches: (tickTimeMs) => new Date(tickTimeMs).getSeconds() % 5 === 0,
    decision: {
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'minute-five-second',
      prominence: 0.6,
    },
  },
]

const GREGORIAN_MINUTE_INSTANCE_VARIANTS: StructuralTickInstanceVariant[] = [
  {
    id: 'five-minute',
    matches: (tickTimeMs) => new Date(tickTimeMs).getMinutes() % 5 === 0,
    decision: {
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hour-five-minute',
      prominence: 0.6,
    },
  },
]

const GREGORIAN_INSTANCE_VARIANCE_DECLARATION: StructuralFamilyInstanceVarianceDeclaration = {
  second: GREGORIAN_SECOND_INSTANCE_VARIANTS,
  minute: GREGORIAN_MINUTE_INSTANCE_VARIANTS,
}

const getCalendarStructuralExpressionDecision = (
  declaration: StructuralCalendarExpressionDeclaration,
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  const activeSpanKind = declaration.activeSpanKindByScale[input.activeScaleLevel] ?? null
  const tickPolicyForScale = declaration.tickPolicyByScale[input.activeScaleLevel]
  const isActiveSpanFamily = family.supportsIntervalExpression && family.kind === activeSpanKind
  const tickOverrides = tickPolicyForScale?.[family.kind]
  const hasExplicitTickPolicy = tickOverrides !== undefined
  const usesGovernedTickPolicy = tickPolicyForScale !== undefined
  const isActiveTickFamily = hasExplicitTickPolicy
    ? tickOverrides.tickState !== 'hidden'
    : !usesGovernedTickPolicy

  const labelStrategy = typeof tickOverrides?.labelStrategy === 'function'
    ? tickOverrides.labelStrategy(input)
    : tickOverrides?.labelStrategy

  return createStructuralExpressionDecision({
    tickState: hasExplicitTickPolicy
      ? tickOverrides.tickState ?? 'visible-labeled'
      : usesGovernedTickPolicy
        ? 'hidden'
        : 'visible-labeled',
    spanState: isActiveSpanFamily ? 'visible' : 'hidden',
    prominence: isActiveTickFamily || isActiveSpanFamily ? 1 : 0,
    showLabel: hasExplicitTickPolicy
      ? tickOverrides.showLabel ?? true
      : !usesGovernedTickPolicy,
    labelStrategy,
    tickRankClass: tickOverrides?.tickRankClass,
  })
}

export const getStructuralExpressionDecision = (
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  if (family.calendarSystemId === 'gregorian') {
    return getCalendarStructuralExpressionDecision(
      GREGORIAN_EXPRESSION_DECLARATION,
      family,
      input,
    )
  }

  if (family.calendarSystemId === 'hebrew') {
    return getCalendarStructuralExpressionDecision(
      HEBREW_EXPRESSION_DECLARATION,
      family,
      input,
    )
  }

  return createStructuralExpressionDecision()
}

export const getStructuralSpanOpacity = (
  decision: StructuralExpressionDecision,
): number | undefined => {
  switch (decision.spanState) {
    case 'hidden':
      return 0
    case 'visible-faint':
      return 0.35
    default:
      return undefined
  }
}

export const getStructuralTickOpacity = (
  decision: StructuralExpressionDecision,
): number | undefined => {
  switch (decision.tickState) {
    case 'hidden':
      return 0
    case 'visible-faint':
      return 0.35
    default:
      return undefined
  }
}

export const getStructuralTickInstanceVariantId = (
  family: StructuralPeriodFamilyDefinition,
  tickTimeMs: number,
): StructuralTickInstanceVariantId => {
  const variantSource =
    family.calendarSystemId === 'gregorian'
      ? GREGORIAN_INSTANCE_VARIANCE_DECLARATION[family.kind] ?? []
      : []

  const variant = variantSource.find((candidate) => candidate.matches(tickTimeMs))

  return variant?.id ?? 'default'
}

export const getStructuralTickInstanceDecision = (
  family: StructuralPeriodFamilyDefinition,
  tickTimeMs: number,
  baseDecision: StructuralExpressionDecision,
): StructuralExpressionDecision => {
  const variantId = getStructuralTickInstanceVariantId(family, tickTimeMs)

  if (variantId === 'default') {
    return baseDecision
  }

  const variantSource =
    family.calendarSystemId === 'gregorian'
      ? GREGORIAN_INSTANCE_VARIANCE_DECLARATION[family.kind] ?? []
      : []
  const variant = variantSource.find((candidate) => candidate.id === variantId)

  return variant
    ? createStructuralExpressionDecision({
        ...baseDecision,
        ...variant.decision,
      })
    : baseDecision
}
