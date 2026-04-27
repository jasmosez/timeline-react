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
  | 'minute-view-five-second'
  | 'minute-view-minute-boundary'
  | 'minute-view-hour-boundary'
  | 'minute-view-day-boundary'
  | 'hour-view-five-minute'
  | 'hour-view-hour-boundary'
  | 'hour-view-day-boundary'
  | 'day-view-third-hour'
  | 'day-view-day-boundary'
  | 'day-view-week-boundary'
  | 'week-view-ordinary-day'
  | 'week-view-week-boundary'
  | 'week-view-month-boundary'
  | 'month-view-context-boundary'
  | 'quarter-view-week-boundary'
  | 'quarter-view-month-boundary-leading'
  | 'quarter-view-month-boundary-supporting'
  | 'year-view-year-boundary'
  | 'year-view-month-boundary'

export type HebrewStructuralLabelStrategy =
  | 'hebrew-minute-view-zman'
  | 'hebrew-minute-view-day-boundary'
  | 'hebrew-minute-view-week-boundary'
  | 'hebrew-hour-view-zman'
  | 'hebrew-hour-view-day-boundary'
  | 'hebrew-hour-view-week-boundary'
  | 'hebrew-day-view-zman'
  | 'hebrew-day-view-day-boundary'
  | 'hebrew-day-view-week-boundary'
  | 'hebrew-week-view-boundary'
  | 'hebrew-month-view-boundary'
  | 'hebrew-quarter-view-boundary-leading'
  | 'hebrew-quarter-view-boundary-supporting'
  | 'hebrew-year-view-boundary'
  | 'hebrew-decade-view-boundary'

export type StructuralTickLabelStrategy =
  | GregorianStructuralLabelStrategy
  | HebrewStructuralLabelStrategy

export const isGregorianStructuralLabelStrategy = (
  labelStrategy: StructuralTickLabelStrategy,
): labelStrategy is GregorianStructuralLabelStrategy => !labelStrategy.startsWith('hebrew-')

export const isHebrewStructuralLabelStrategy = (
  labelStrategy: StructuralTickLabelStrategy,
): labelStrategy is HebrewStructuralLabelStrategy => labelStrategy.startsWith('hebrew-')

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
  | 'third-hour'

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

const labeledTickPolicy = (
  labelStrategy: NonNullable<StructuralFamilyPolicy['labelStrategy']>,
  tickRankClass: StructuralTickRankClass,
): StructuralFamilyPolicy => ({
  tickState: 'visible-labeled',
  showLabel: true,
  labelStrategy,
  tickRankClass,
})

const unlabeledTickPolicy = (
  tickRankClass: StructuralTickRankClass,
): StructuralFamilyPolicy => ({
  tickState: 'visible-unlabeled',
  showLabel: false,
  tickRankClass,
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
      second: unlabeledTickPolicy('tick-rank-ordinary'),
      minute: labeledTickPolicy('minute-view-minute-boundary', 'tick-rank-secondary'),
      hour: labeledTickPolicy('minute-view-hour-boundary', 'tick-rank-secondary'),
      day: labeledTickPolicy('minute-view-day-boundary', 'tick-rank-primary'),
    },
    [SCALE_HOUR]: {
      minute: unlabeledTickPolicy('tick-rank-ordinary'),
      hour: labeledTickPolicy('hour-view-hour-boundary', 'tick-rank-secondary'),
      day: labeledTickPolicy('hour-view-day-boundary', 'tick-rank-primary'),
    },
    [SCALE_DAY]: {
      hour: unlabeledTickPolicy('tick-rank-ordinary'),
      day: labeledTickPolicy('day-view-day-boundary', 'tick-rank-secondary'),
      week: labeledTickPolicy('day-view-week-boundary', 'tick-rank-primary'),
    },
    [SCALE_WEEK]: {
      day: labeledTickPolicy('week-view-ordinary-day', 'tick-rank-ordinary'),
      week: labeledTickPolicy('week-view-week-boundary', 'tick-rank-secondary'),
      month: labeledTickPolicy('week-view-month-boundary', 'tick-rank-primary'),
    },
    [SCALE_MONTH]: {
      day: labeledTickPolicy('month-view-context-boundary', 'tick-rank-ordinary'),
      week: labeledTickPolicy('month-view-context-boundary', 'tick-rank-secondary'),
      month: labeledTickPolicy('month-view-context-boundary', 'tick-rank-primary'),
      quarter: labeledTickPolicy('month-view-context-boundary', 'tick-rank-primary'),
    },
    [SCALE_QUARTER]: {
      week: labeledTickPolicy('quarter-view-week-boundary', 'tick-rank-ordinary'),
      month: {
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'gregorian'
            ? 'quarter-view-month-boundary-leading'
            : 'quarter-view-month-boundary-supporting',
        tickState: 'visible-labeled',
        showLabel: true,
        tickRankClass: 'tick-rank-secondary',
      },
      quarter: {
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'gregorian'
            ? 'quarter-view-month-boundary-leading'
            : 'quarter-view-month-boundary-supporting',
        tickState: 'visible-labeled',
        showLabel: true,
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_YEAR]: {
      month: labeledTickPolicy('year-view-month-boundary', 'tick-rank-ordinary'),
      year: labeledTickPolicy('year-view-year-boundary', 'tick-rank-primary'),
      quarter: unlabeledTickPolicy('tick-rank-secondary'),
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
    [SCALE_MINUTE]: {
      zmanim: labeledTickPolicy('hebrew-minute-view-zman', 'tick-rank-ordinary'),
      day: labeledTickPolicy('hebrew-minute-view-day-boundary', 'tick-rank-secondary'),
      week: labeledTickPolicy('hebrew-minute-view-week-boundary', 'tick-rank-primary'),
    },
    [SCALE_HOUR]: {
      zmanim: labeledTickPolicy('hebrew-hour-view-zman', 'tick-rank-ordinary'),
      day: labeledTickPolicy('hebrew-hour-view-day-boundary', 'tick-rank-secondary'),
      week: labeledTickPolicy('hebrew-hour-view-week-boundary', 'tick-rank-primary'),
    },
    [SCALE_DAY]: {
      zmanim: labeledTickPolicy('hebrew-day-view-zman', 'tick-rank-ordinary'),
      day: labeledTickPolicy('hebrew-day-view-day-boundary', 'tick-rank-secondary'),
      week: labeledTickPolicy('hebrew-day-view-week-boundary', 'tick-rank-primary'),
    },
    [SCALE_WEEK]: {
      day: labeledTickPolicy('hebrew-week-view-boundary', 'tick-rank-ordinary'),
      week: labeledTickPolicy('hebrew-week-view-boundary', 'tick-rank-secondary'),
      month: labeledTickPolicy('hebrew-week-view-boundary', 'tick-rank-primary'),
    },
    [SCALE_MONTH]: {
      day: labeledTickPolicy('hebrew-month-view-boundary', 'tick-rank-ordinary'),
      week: labeledTickPolicy('hebrew-month-view-boundary', 'tick-rank-secondary'),
      month: labeledTickPolicy('hebrew-month-view-boundary', 'tick-rank-primary'),
      quarter: labeledTickPolicy('hebrew-month-view-boundary', 'tick-rank-primary'),
    },
    [SCALE_QUARTER]: {
      month: {
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'hebrew'
            ? 'hebrew-quarter-view-boundary-leading'
            : 'hebrew-quarter-view-boundary-supporting',
        tickState: 'visible-labeled',
        showLabel: true,
        tickRankClass: 'tick-rank-secondary',
      },
      quarter: {
        labelStrategy: (input) =>
          input.leadingCalendarSystemId === 'hebrew'
            ? 'hebrew-quarter-view-boundary-leading'
            : 'hebrew-quarter-view-boundary-supporting',
        tickState: 'visible-labeled',
        showLabel: true,
        tickRankClass: 'tick-rank-primary',
      },
    },
    [SCALE_YEAR]: {
      month: labeledTickPolicy('hebrew-year-view-boundary', 'tick-rank-ordinary'),
      year: labeledTickPolicy('hebrew-year-view-boundary', 'tick-rank-primary'),
      quarter: unlabeledTickPolicy('tick-rank-secondary'),
    },
    [SCALE_DECADE]: {
      year: labeledTickPolicy('hebrew-decade-view-boundary', 'tick-rank-ordinary'),
      shmita: labeledTickPolicy('hebrew-decade-view-boundary', 'tick-rank-primary'),
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
      labelStrategy: 'minute-view-five-second',
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
      labelStrategy: 'hour-view-five-minute',
      prominence: 0.6,
    },
  },
]

const GREGORIAN_HOUR_INSTANCE_VARIANTS: StructuralTickInstanceVariant[] = [
  {
    id: 'third-hour',
    matches: (tickTimeMs) => new Date(tickTimeMs).getHours() % 3 === 0,
    decision: {
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'day-view-third-hour',
      prominence: 0.6,
    },
  },
]

const GREGORIAN_INSTANCE_VARIANCE_DECLARATION: StructuralFamilyInstanceVarianceDeclaration = {
  second: GREGORIAN_SECOND_INSTANCE_VARIANTS,
  minute: GREGORIAN_MINUTE_INSTANCE_VARIANTS,
  hour: GREGORIAN_HOUR_INSTANCE_VARIANTS,
}

const STRUCTURAL_EXPRESSION_DECLARATIONS: Partial<
  Record<StructuralCalendarSystemId, StructuralCalendarExpressionDeclaration>
> = {
  gregorian: GREGORIAN_EXPRESSION_DECLARATION,
  hebrew: HEBREW_EXPRESSION_DECLARATION,
}

const STRUCTURAL_INSTANCE_VARIANCE_DECLARATIONS: Partial<
  Record<StructuralCalendarSystemId, StructuralFamilyInstanceVarianceDeclaration>
> = {
  gregorian: GREGORIAN_INSTANCE_VARIANCE_DECLARATION,
}

const getStructuralExpressionDeclaration = (
  calendarSystemId: StructuralCalendarSystemId,
) => STRUCTURAL_EXPRESSION_DECLARATIONS[calendarSystemId]

const getStructuralInstanceVariants = (
  family: StructuralPeriodFamilyDefinition,
) => STRUCTURAL_INSTANCE_VARIANCE_DECLARATIONS[family.calendarSystemId]?.[family.kind] ?? []

const resolveStructuralLabelStrategy = (
  tickOverrides: StructuralFamilyPolicy | undefined,
  input: StructuralExpressionPolicyInput,
) => typeof tickOverrides?.labelStrategy === 'function'
  ? tickOverrides.labelStrategy(input)
  : tickOverrides?.labelStrategy

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
    labelStrategy: resolveStructuralLabelStrategy(tickOverrides, input),
    tickRankClass: tickOverrides?.tickRankClass,
  })
}

export const getStructuralExpressionDecision = (
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  const declaration = getStructuralExpressionDeclaration(family.calendarSystemId)

  if (declaration) {
    return getCalendarStructuralExpressionDecision(declaration, family, input)
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
  const variant = getStructuralInstanceVariants(family)
    .find((candidate) => candidate.matches(tickTimeMs))

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

  const variant = getStructuralInstanceVariants(family)
    .find((candidate) => candidate.id === variantId)

  return variant
    ? createStructuralExpressionDecision({
        ...baseDecision,
        ...variant.decision,
      })
    : baseDecision
}
