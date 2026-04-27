import {
  createStructuralExpressionDecision,
  getStructuralExpressionDecision,
  getStructuralSpanOpacity,
  getStructuralTickInstanceDecision,
  getStructuralTickInstanceVariantId,
  type StructuralExpressionPolicyInput,
} from '../src/timeline/structuralExpressionPolicy'
import {
  GREGORIAN_PERIOD_FAMILY_IDS,
  HEBREW_PERIOD_FAMILY_IDS,
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
    })
  })

  it('computes real Gregorian tick decisions for calmer structural scales', () => {
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)
    const quarterFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.quarter)

    expect(dayFamily).toBeDefined()
    expect(quarterFamily).toBeDefined()

    expect(getStructuralExpressionDecision(dayFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
    })
    expect(getStructuralExpressionDecision(quarterFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'hidden',
      showLabel: false,
    })

    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
    })
  })

  it('computes real Hebrew span decisions from family and scale', () => {
    const activeFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.day)
    const inactiveFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.month)

    expect(activeFamily).toBeDefined()
    expect(inactiveFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      activeFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      spanState: 'visible',
      prominence: 1,
    })
    expect(getStructuralExpressionDecision(
      inactiveFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      spanState: 'hidden',
    })
    expect(getStructuralExpressionDecision(
      inactiveFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      spanState: 'visible',
      prominence: 1,
    })
  })

  it('computes real Hebrew tick decisions for calmer structural scales', () => {
    const dayFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.day)
    const quarterFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.quarter)
    const shmitaFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.shmita)

    expect(dayFamily).toBeDefined()
    expect(quarterFamily).toBeDefined()
    expect(shmitaFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'hidden',
      showLabel: false,
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
    })
    expect(getStructuralExpressionDecision(
      shmitaFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 6 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
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

  it('classifies and overrides Gregorian second-family instance variance declaratively', () => {
    const secondFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.second)

    expect(secondFamily).toBeDefined()
    expect(
      getStructuralTickInstanceVariantId(
        secondFamily!,
        new Date('2026-04-01T12:00:05-04:00').getTime(),
      ),
    ).toBe('five-second')
    expect(
      getStructuralTickInstanceVariantId(
        secondFamily!,
        new Date('2026-04-01T12:01:00-04:00').getTime(),
      ),
    ).toBe('top-of-minute')
    expect(
      getStructuralTickInstanceVariantId(
        secondFamily!,
        new Date('2026-04-01T13:00:00-04:00').getTime(),
      ),
    ).toBe('top-of-hour')
    expect(
      getStructuralTickInstanceVariantId(
        secondFamily!,
        new Date('2026-04-02T00:00:00-04:00').getTime(),
      ),
    ).toBe('midnight-boundary')

    expect(
      getStructuralTickInstanceDecision(
        secondFamily!,
        new Date('2026-04-01T12:00:05-04:00').getTime(),
        createStructuralExpressionDecision({
          tickState: 'visible-unlabeled',
          showLabel: false,
          prominence: 0.2,
        }),
      ),
    ).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      prominence: 0.6,
    })
  })

  it('exposes seed period families by calendar', () => {
    expect(getStructuralPeriodFamiliesForCalendar('gregorian').map((family) => family.id)).toContain('gregorian-day')
    expect(getStructuralPeriodFamiliesForCalendar('hebrew').map((family) => family.id)).toContain('hebrew-month')
    expect(getStructuralPeriodFamiliesForCalendar('life-relative').map((family) => family.id)).toContain('life-relative-day')
  })
})
