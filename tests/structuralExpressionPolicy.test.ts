import {
  createStructuralExpressionDecision,
  getStructuralExpressionDecision,
  getStructuralSpanOpacity,
  type StructuralExpressionPolicyInput,
} from '../src/timeline/structuralExpressionPolicy'
import {
  GREGORIAN_PERIOD_FAMILY_IDS,
  STRUCTURAL_PERIOD_FAMILIES,
  getStructuralPeriodFamilyById,
  getStructuralPeriodFamiliesForCalendar,
} from '../src/timeline/structuralPeriodFamilies'

const TEST_POLICY_INPUT: StructuralExpressionPolicyInput = {
  activeScaleLevel: 2,
  visibleDurationMs: 8 * 24 * 60 * 60 * 1000,
  leadingCalendarSystemId: 'gregorian',
  environment: {
    now: new Date('2026-04-01T12:00:00-04:00'),
    birthDate: new Date('1982-04-19T02:25:00-05:00'),
    timezone: 'America/New_York',
    location: {
      city: 'Northampton',
      region: 'MA',
      postalCode: '01060',
      latitude: 42.3251,
      longitude: -72.6412,
    },
  },
}

describe('structural expression policy skeleton', () => {
  it('creates default decisions with overridable fields', () => {
    expect(createStructuralExpressionDecision()).toEqual({
      tickState: 'visible-labeled',
      spanState: 'visible',
      contextState: 'none',
      prominence: 1,
      showLabel: true,
      showSpanLabel: false,
    })

    expect(createStructuralExpressionDecision({ tickState: 'emphasized', prominence: 2 })).toMatchObject({
      tickState: 'emphasized',
      prominence: 2,
      spanState: 'visible',
    })
  })

  it('computes real Gregorian span decisions from family and scale', () => {
    const activeFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)
    const inactiveFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.week)

    expect(activeFamily).toBeDefined()
    expect(inactiveFamily).toBeDefined()

    expect(getStructuralExpressionDecision(activeFamily!, TEST_POLICY_INPUT)).toMatchObject({
      spanState: 'visible',
      prominence: 1,
    })
    expect(getStructuralExpressionDecision(inactiveFamily!, TEST_POLICY_INPUT)).toMatchObject({
      spanState: 'hidden',
      prominence: 0,
    })
  })

  it('maps span decisions to presentation opacity without changing visible defaults', () => {
    expect(getStructuralSpanOpacity(createStructuralExpressionDecision())).toBeUndefined()
    expect(
      getStructuralSpanOpacity(createStructuralExpressionDecision({ spanState: 'visible-faint' })),
    ).toBe(0.35)
    expect(
      getStructuralSpanOpacity(createStructuralExpressionDecision({ spanState: 'hidden' })),
    ).toBe(0)
  })

  it('exposes seed period families by calendar', () => {
    expect(getStructuralPeriodFamiliesForCalendar('gregorian').map((family) => family.id)).toContain('gregorian-day')
    expect(getStructuralPeriodFamiliesForCalendar('hebrew').map((family) => family.id)).toContain('hebrew-month')
    expect(getStructuralPeriodFamiliesForCalendar('life-relative').map((family) => family.id)).toContain('life-relative-day')
  })
})
