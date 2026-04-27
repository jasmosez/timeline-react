import type { ScaleLevel } from './scales'
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

export type StructuralExpressionDecision = {
  tickState: StructuralExpressionTickState
  spanState: StructuralExpressionSpanState
  contextState: StructuralExpressionContextState
  prominence: number
  showLabel: boolean
  showSpanLabel: boolean
}

export type StructuralExpressionMetadata = {
  structuralPeriodFamilyId?: string
  structuralCalendarSystemId?: StructuralCalendarSystemId
  structuralSignificance?: StructuralExpressionSignificance
}

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

const GREGORIAN_TICK_POLICY_BY_SCALE: Partial<
  Record<ScaleLevel, Partial<Record<string, Partial<StructuralExpressionDecision>>>>
> = {
  2: {
    day: { tickState: 'visible-labeled', showLabel: true },
    week: { tickState: 'visible-labeled', showLabel: true },
    month: { tickState: 'visible-labeled', showLabel: true },
  },
  3: {
    day: { tickState: 'visible-labeled', showLabel: true },
    week: { tickState: 'visible-labeled', showLabel: true },
    month: { tickState: 'visible-labeled', showLabel: true },
    quarter: { tickState: 'visible-labeled', showLabel: true },
  },
  4: {
    week: { tickState: 'visible-labeled', showLabel: true },
    month: { tickState: 'visible-labeled', showLabel: true },
    quarter: { tickState: 'visible-labeled', showLabel: true },
  },
  5: {
    month: { tickState: 'visible-labeled', showLabel: true },
    year: { tickState: 'visible-labeled', showLabel: true },
    quarter: { tickState: 'visible-unlabeled', showLabel: false },
  },
  6: {
    year: { tickState: 'visible-labeled', showLabel: true },
    decade: { tickState: 'visible-labeled', showLabel: true },
  },
}

const getGregorianActiveSpanKind = (activeScaleLevel: ScaleLevel) => {
  switch (activeScaleLevel) {
    case -1:
      return 'second'
    case 0:
      return 'minute'
    case 1:
      return 'hour'
    case 2:
    case 3:
      return 'day'
    case 4:
      return 'week'
    case 5:
      return 'month'
    case 6:
      return 'year'
    default:
      return null
  }
}

const getGregorianStructuralExpressionDecision = (
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  const activeSpanKind = getGregorianActiveSpanKind(input.activeScaleLevel)
  const tickPolicyForScale = GREGORIAN_TICK_POLICY_BY_SCALE[input.activeScaleLevel]
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
  })
}

const getHebrewActiveSpanKind = (activeScaleLevel: ScaleLevel) => {
  switch (activeScaleLevel) {
    case -1:
    case 0:
    case 1:
      return 'zmanim'
    case 2:
    case 3:
      return 'day'
    case 4:
    case 5:
      return 'month'
    case 6:
      return 'year'
    default:
      return null
  }
}

const getHebrewStructuralExpressionDecision = (
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  const activeSpanKind = getHebrewActiveSpanKind(input.activeScaleLevel)
  const isActiveSpanFamily = family.supportsIntervalExpression && family.kind === activeSpanKind

  return createStructuralExpressionDecision({
    spanState: isActiveSpanFamily ? 'visible' : 'hidden',
    prominence: isActiveSpanFamily ? 1 : 0,
  })
}

export const getStructuralExpressionDecision = (
  family: StructuralPeriodFamilyDefinition,
  input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => {
  if (family.calendarSystemId === 'gregorian') {
    return getGregorianStructuralExpressionDecision(family, input)
  }

  if (family.calendarSystemId === 'hebrew') {
    return getHebrewStructuralExpressionDecision(family, input)
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
