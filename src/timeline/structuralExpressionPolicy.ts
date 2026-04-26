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

// Phase 1 intentionally keeps policy behavior as a stub. Runtime systems can
// start attaching metadata now without changing current rendered behavior.
export const getStructuralExpressionDecision = (
  _family: StructuralPeriodFamilyDefinition,
  _input: StructuralExpressionPolicyInput,
): StructuralExpressionDecision => createStructuralExpressionDecision()
