import {
  createStructuralExpressionDecision,
  getStructuralExpressionDecision,
  type StructuralExpressionPolicyInput,
} from '../src/timeline/structuralExpressionPolicy'
import {
  STRUCTURAL_PERIOD_FAMILIES,
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

  it('returns a default no-op policy decision in phase 1', () => {
    const family = STRUCTURAL_PERIOD_FAMILIES[0]

    expect(getStructuralExpressionDecision(family, TEST_POLICY_INPUT)).toEqual(
      createStructuralExpressionDecision(),
    )
  })

  it('exposes seed period families by calendar', () => {
    expect(getStructuralPeriodFamiliesForCalendar('gregorian').map((family) => family.id)).toContain('gregorian-day')
    expect(getStructuralPeriodFamiliesForCalendar('hebrew').map((family) => family.id)).toContain('hebrew-month')
    expect(getStructuralPeriodFamiliesForCalendar('life-relative').map((family) => family.id)).toContain('life-relative-day')
  })
})
