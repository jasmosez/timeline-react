import type {
  StructuralCalendarSystemId,
  StructuralPeriodFamilyDefinition,
} from './structuralExpressionPolicy'

const defineFamily = (
  family: StructuralPeriodFamilyDefinition,
): StructuralPeriodFamilyDefinition => family

// Phase 1 seed registry. This is intentionally incomplete: it establishes the
// declarative shape before Gregorian and Hebrew are migrated family-by-family.
export const STRUCTURAL_PERIOD_FAMILIES: StructuralPeriodFamilyDefinition[] = [
  defineFamily({
    id: 'gregorian-day',
    calendarSystemId: 'gregorian',
    kind: 'day',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: 'gregorian-week',
    calendarSystemId: 'gregorian',
    kind: 'week',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: 'hebrew-day',
    calendarSystemId: 'hebrew',
    kind: 'day',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: 'hebrew-month',
    calendarSystemId: 'hebrew',
    kind: 'month',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: 'life-relative-day',
    calendarSystemId: 'life-relative',
    kind: 'day',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
    notes: 'Target family only for now; not yet structurally implemented.',
  }),
]

export const getStructuralPeriodFamiliesForCalendar = (
  calendarSystemId: StructuralCalendarSystemId,
) => STRUCTURAL_PERIOD_FAMILIES.filter((family) => family.calendarSystemId === calendarSystemId)
