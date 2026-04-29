import type {
  StructuralCalendarSystemId,
  StructuralPeriodFamilyDefinition,
} from './structuralExpressionPolicy'

const defineFamily = (
  family: StructuralPeriodFamilyDefinition,
): StructuralPeriodFamilyDefinition => family

export const GREGORIAN_PERIOD_FAMILY_IDS = {
  second: 'gregorian-second',
  minute: 'gregorian-minute',
  hour: 'gregorian-hour',
  day: 'gregorian-day',
  week: 'gregorian-week',
  month: 'gregorian-month',
  quarter: 'gregorian-quarter',
  year: 'gregorian-year',
  decade: 'gregorian-decade',
} as const

export const HEBREW_PERIOD_FAMILY_IDS = {
  zmanim: 'hebrew-zmanim',
  day: 'hebrew-day',
  week: 'hebrew-week',
  month: 'hebrew-month',
  quarter: 'hebrew-quarter',
  year: 'hebrew-year',
  shmita: 'hebrew-shmita',
} as const

export const LIFE_RELATIVE_PERIOD_FAMILY_IDS = {
  day: 'life-relative-day',
} as const

// Phase 1 seed registry. This is intentionally incomplete: it establishes the
// declarative shape before Gregorian and Hebrew are migrated family-by-family.
export const STRUCTURAL_PERIOD_FAMILIES: StructuralPeriodFamilyDefinition[] = [
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.second,
    calendarSystemId: 'gregorian',
    kind: 'second',
    significance: 'local',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.minute,
    calendarSystemId: 'gregorian',
    kind: 'minute',
    significance: 'local',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.hour,
    calendarSystemId: 'gregorian',
    kind: 'hour',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.day,
    calendarSystemId: 'gregorian',
    kind: 'day',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.week,
    calendarSystemId: 'gregorian',
    kind: 'week',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.month,
    calendarSystemId: 'gregorian',
    kind: 'month',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.quarter,
    calendarSystemId: 'gregorian',
    kind: 'quarter',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.year,
    calendarSystemId: 'gregorian',
    kind: 'year',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: GREGORIAN_PERIOD_FAMILY_IDS.decade,
    calendarSystemId: 'gregorian',
    kind: 'decade',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.zmanim,
    calendarSystemId: 'hebrew',
    kind: 'zmanim',
    significance: 'local',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.day,
    calendarSystemId: 'hebrew',
    kind: 'day',
    significance: 'intermediate',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.week,
    calendarSystemId: 'hebrew',
    kind: 'week',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
    notes: 'Current structural expression uses weekly boundaries without week labels.',
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.month,
    calendarSystemId: 'hebrew',
    kind: 'month',
    significance: 'major',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.quarter,
    calendarSystemId: 'hebrew',
    kind: 'quarter',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.year,
    calendarSystemId: 'hebrew',
    kind: 'year',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: HEBREW_PERIOD_FAMILY_IDS.shmita,
    calendarSystemId: 'hebrew',
    kind: 'shmita',
    significance: 'macro',
    supportsBoundaryExpression: true,
    supportsIntervalExpression: true,
    supportsLabels: true,
    supportsStickyContext: true,
  }),
  defineFamily({
    id: LIFE_RELATIVE_PERIOD_FAMILY_IDS.day,
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

export const getStructuralPeriodFamilyById = (id: string) =>
  STRUCTURAL_PERIOD_FAMILIES.find((family) => family.id === id)
