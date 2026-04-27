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
    const weekFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.week)
    const monthFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.month)
    const quarterFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.quarter)
    const yearFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.year)

    expect(dayFamily).toBeDefined()
    expect(weekFamily).toBeDefined()
    expect(monthFamily).toBeDefined()
    expect(quarterFamily).toBeDefined()
    expect(yearFamily).toBeDefined()

    expect(getStructuralExpressionDecision(dayFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'weekday-plus-day',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(weekFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'week-plus-day',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(monthFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'week-view-contextual',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(quarterFamily!, TEST_POLICY_INPUT)).toMatchObject({
      tickState: 'hidden',
      showLabel: false,
    })

    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 3 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'month-contextual',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      weekFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'week-number',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      monthFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'quarter-boundary-primary',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'quarter-boundary-primary',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      {
        ...TEST_POLICY_INPUT,
        activeScaleLevel: 4,
        leadingCalendarSystemId: 'hebrew',
      },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'quarter-boundary-secondary',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      monthFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'month-in-year',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      yearFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'year-boundary',
      tickRankClass: 'tick-rank-primary',
    })
  })

  it('computes real Gregorian minute-view family decisions and instance variance', () => {
    const secondFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.second)
    const minuteFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.minute)
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)

    expect(secondFamily).toBeDefined()
    expect(minuteFamily).toBeDefined()
    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      secondFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: -1 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      minuteFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: -1 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'minute-top-of-minute',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      hourFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: -1 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'minute-top-of-hour',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: -1 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'minute-midnight-boundary',
      tickRankClass: 'tick-rank-primary',
    })
  })

  it('computes real Gregorian hour-view family decisions and instance variance', () => {
    const minuteFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.minute)
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)

    expect(minuteFamily).toBeDefined()
    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      minuteFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 0 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      hourFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 0 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hour-top-of-hour',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 0 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hour-midnight-boundary',
      tickRankClass: 'tick-rank-primary',
    })
  })

  it('computes real Gregorian day-view family decisions and instance variance', () => {
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)
    const weekFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.week)

    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()
    expect(weekFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      hourFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 1 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 1 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'day-midnight-boundary',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      weekFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 1 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'day-week-boundary',
      tickRankClass: 'tick-rank-primary',
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
    const weekFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.week)
    const monthFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.month)
    const quarterFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.quarter)
    const yearFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.year)
    const shmitaFamily = getStructuralPeriodFamilyById(HEBREW_PERIOD_FAMILY_IDS.shmita)

    expect(dayFamily).toBeDefined()
    expect(weekFamily).toBeDefined()
    expect(monthFamily).toBeDefined()
    expect(quarterFamily).toBeDefined()
    expect(yearFamily).toBeDefined()
    expect(shmitaFamily).toBeDefined()

    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-week-scale',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      weekFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-week-scale',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      monthFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-week-scale',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 2 },
    )).toMatchObject({
      tickState: 'hidden',
      showLabel: false,
    })
    expect(getStructuralExpressionDecision(
      dayFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 3 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-month-scale',
      tickRankClass: 'tick-rank-ordinary',
    })
    expect(getStructuralExpressionDecision(
      monthFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-quarter-scale-secondary',
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 4 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-quarter-scale-secondary',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      {
        ...TEST_POLICY_INPUT,
        activeScaleLevel: 4,
        leadingCalendarSystemId: 'hebrew',
      },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-quarter-scale-primary',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      quarterFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-unlabeled',
      showLabel: false,
      tickRankClass: 'tick-rank-secondary',
    })
    expect(getStructuralExpressionDecision(
      yearFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 5 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-year-scale',
      tickRankClass: 'tick-rank-primary',
    })
    expect(getStructuralExpressionDecision(
      shmitaFamily!,
      { ...TEST_POLICY_INPUT, activeScaleLevel: 6 },
    )).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hebrew-decade-scale',
      tickRankClass: 'tick-rank-primary',
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

  it('classifies and overrides Gregorian minute-view instance variance declaratively', () => {
    const secondFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.second)
    const minuteFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.minute)
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)

    expect(secondFamily).toBeDefined()
    expect(minuteFamily).toBeDefined()
    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()
    expect(
      getStructuralTickInstanceVariantId(
        secondFamily!,
        new Date('2026-04-01T12:00:05-04:00').getTime(),
      ),
    ).toBe('five-second')
    expect(
      getStructuralTickInstanceVariantId(
        minuteFamily!,
        new Date('2026-04-01T12:01:00-04:00').getTime(),
      ),
    ).toBe('default')
    expect(
      getStructuralTickInstanceVariantId(
        hourFamily!,
        new Date('2026-04-01T13:00:00-04:00').getTime(),
      ),
    ).toBe('default')
    expect(
      getStructuralTickInstanceVariantId(
        dayFamily!,
        new Date('2026-04-02T00:00:00-04:00').getTime(),
      ),
    ).toBe('default')

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
      labelStrategy: 'minute-five-second',
      prominence: 0.6,
    })
  })

  it('classifies and overrides Gregorian hour-view instance variance declaratively', () => {
    const minuteFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.minute)
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)

    expect(minuteFamily).toBeDefined()
    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()
    expect(
      getStructuralTickInstanceVariantId(
        minuteFamily!,
        new Date('2026-04-01T12:05:00-04:00').getTime(),
      ),
    ).toBe('five-minute')
    expect(
      getStructuralTickInstanceVariantId(
        hourFamily!,
        new Date('2026-04-01T13:00:00-04:00').getTime(),
      ),
    ).toBe('default')
    expect(
      getStructuralTickInstanceVariantId(
        dayFamily!,
        new Date('2026-04-02T00:00:00-04:00').getTime(),
      ),
    ).toBe('default')

    expect(
      getStructuralTickInstanceDecision(
        minuteFamily!,
        new Date('2026-04-01T12:05:00-04:00').getTime(),
        createStructuralExpressionDecision({
          tickState: 'visible-unlabeled',
          showLabel: false,
          tickRankClass: 'tick-rank-ordinary',
          prominence: 0.2,
        }),
      ),
    ).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'hour-five-minute',
      tickRankClass: 'tick-rank-ordinary',
      prominence: 0.6,
    })
  })

  it('classifies and overrides Gregorian day-view instance variance declaratively', () => {
    const hourFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.hour)
    const dayFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.day)
    const weekFamily = getStructuralPeriodFamilyById(GREGORIAN_PERIOD_FAMILY_IDS.week)

    expect(hourFamily).toBeDefined()
    expect(dayFamily).toBeDefined()
    expect(weekFamily).toBeDefined()
    expect(
      getStructuralTickInstanceVariantId(
        hourFamily!,
        new Date('2026-04-01T03:00:00-04:00').getTime(),
      ),
    ).toBe('third-hour')
    expect(
      getStructuralTickInstanceVariantId(
        dayFamily!,
        new Date('2026-04-01T00:00:00-04:00').getTime(),
      ),
    ).toBe('default')
    expect(
      getStructuralTickInstanceVariantId(
        weekFamily!,
        new Date('2026-03-29T00:00:00-04:00').getTime(),
      ),
    ).toBe('default')

    expect(
      getStructuralTickInstanceDecision(
        hourFamily!,
        new Date('2026-04-01T03:00:00-04:00').getTime(),
        createStructuralExpressionDecision({
          tickState: 'visible-unlabeled',
          showLabel: false,
          tickRankClass: 'tick-rank-ordinary',
          prominence: 0.2,
        }),
      ),
    ).toMatchObject({
      tickState: 'visible-labeled',
      showLabel: true,
      labelStrategy: 'day-third-hour',
      tickRankClass: 'tick-rank-ordinary',
      prominence: 0.6,
    })
  })

  it('exposes seed period families by calendar', () => {
    expect(getStructuralPeriodFamiliesForCalendar('gregorian').map((family) => family.id)).toContain('gregorian-day')
    expect(getStructuralPeriodFamiliesForCalendar('hebrew').map((family) => family.id)).toContain('hebrew-month')
    expect(getStructuralPeriodFamiliesForCalendar('life-relative').map((family) => family.id)).toContain('life-relative-day')
  })
})
