import { LOCALE } from '../config'
import type { ScaleLevel, ScaleLevelConfig } from './scales'

// Constants for time in milliseconds
const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

// Gregorian interval stepping
const addSeconds = (date: Date, seconds: number) => date.getTime() + seconds * SECOND_IN_MS
const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * MINUTE_IN_MS
const addHours = (date: Date, hours: number) => date.getTime() + hours * HOUR_IN_MS
const addDays = (date: Date, days: number) => {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + days)
  return newDate.getTime()
}

const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date)
  newDate.setMonth(date.getMonth() + months)
  return newDate.getTime()
}

const addYears = (date: Date, years: number) => {
  const newDate = new Date(date)
  newDate.setFullYear(date.getFullYear() + years)
  return newDate.getTime()
}

// Gregorian containing-period boundaries
const startOfMinute = (date: Date) => {
  const newDate = new Date(date)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

const startOfHour = (date: Date) => {
  const newDate = new Date(date)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

const startOfDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

const startOfWeek = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setDate(date.getDate() - date.getDay())
  return newDate
}

const startOfMonth = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setDate(1)
  return newDate
}

const startOfQuarter = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setMonth(Math.floor(date.getMonth() / 3) * 3)
  newDate.setDate(1)
  return newDate
}

const startOfYear = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setMonth(0)
  newDate.setDate(1)
  return newDate
}

const startOfDecade = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setFullYear(Math.floor(date.getFullYear() / 10) * 10)
  newDate.setMonth(0)
  newDate.setDate(1)
  return newDate
}

// Gregorian tick label formatting
const SECOND: Intl.DateTimeFormatOptions = { second: '2-digit' }
const MINUTE: Intl.DateTimeFormatOptions = { minute: '2-digit' }
const HOUR: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
const DAY: Intl.DateTimeFormatOptions = { day: 'numeric' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const MONTH: Intl.DateTimeFormatOptions = { month: 'short' }
const YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' }

const isMidnight = (tickDate: Date) => tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0
const isTopOfHour = (tickDate: Date) => tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0
const is3rdHour = (tickDate: Date) => tickDate.getHours() % 3 === 0
const is5thMin = (tickDate: Date) => tickDate.getMinutes() % 5 === 0
const is1stOfMonth = (tickDate: Date) => tickDate.getDate() === 1
const is1stOfYear = (tickDate: Date) => tickDate.getMonth() === 0 && tickDate.getDate() === 1
const isStartOfQuarter = (tickDate: Date) => tickDate.getMonth() % 3 === 0 && is1stOfMonth(tickDate)
const is10thSec = (tickDate: Date) => tickDate.getSeconds() % 10 === 0
const isTopOfMinute = (tickDate: Date) => tickDate.getSeconds() === 0
const hasTimezoneOffsetChange = (tickDate: Date) =>
  tickDate.getTimezoneOffset() !== new Date(addHours(tickDate, -1)).getTimezoneOffset()
const repeatsPreviousLocalHour = (tickDate: Date) => {
  const previousHour = new Date(addHours(tickDate, -1))

  return tickDate.getHours() === previousHour.getHours()
    && tickDate.getMinutes() === previousHour.getMinutes()
}
const formatHourWithOptionalTimezone = (tickDate: Date) =>
  tickDate.toLocaleTimeString(
    LOCALE,
    hasTimezoneOffsetChange(tickDate) || repeatsPreviousLocalHour(tickDate)
      ? { ...HOUR, timeZoneName: 'short' }
      : HOUR,
  )

const renderTickLabelMinute = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)

  if (isMidnight(tickDate)) {
    return tickDate.toLocaleDateString(LOCALE, { ...WEEKDAY, ...DAY, ...HOUR })
  }
  if (isTopOfHour(tickDate)) {
    return tickDate.toLocaleTimeString(LOCALE, HOUR)
  }
  if (isTopOfMinute(tickDate)) {
    return tickDate.toLocaleTimeString(LOCALE, { ...HOUR, ...MINUTE })
  }
  if (isFirstTick) {
    return tickDate.toLocaleTimeString(LOCALE, { ...HOUR, ...MINUTE, ...SECOND })
  }
  if (is10thSec(tickDate)) {
    return `:${String(tickDate.getSeconds()).padStart(2, '0')}`
  }
}

const renderTickLabelHour = (tickTime: number) => {
  const tickDate = new Date(tickTime)

  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR)}`
  }
  if (isTopOfHour(tickDate)) {
    return formatHourWithOptionalTimezone(tickDate)
  }
  if (is5thMin(tickDate)) {
    return `:${String(tickDate.getMinutes()).padStart(2, '0')}`
  }
}

const renderTickLabelDay = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR)}`
  }
  if (is3rdHour(tickDate)) {
    return formatHourWithOptionalTimezone(tickDate)
  }
}

const renderTickLabelWeek = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
}

const renderTickLabelMonth = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  const showMonth = isFirstTick || is1stOfMonth(tickDate)
  const showYear = is1stOfYear(tickDate)
  const isSunday = tickDate.getDay() === 0

  if (isSunday && showMonth) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, {
      ...DAY,
      ...MONTH,
      ...(showYear ? YEAR : {}),
    })}`
  }

  if (isSunday && !showYear) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
  }

  return tickDate.toLocaleDateString(LOCALE, {
    ...DAY,
    ...(showMonth ? MONTH : {}),
    ...(showYear ? YEAR : {}),
  })
}

const renderTickLabelQuarter = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  if (isStartOfQuarter(tickDate)) {
    return `Q${Math.floor(tickDate.getMonth() / 3) + 1}, ${tickDate.toLocaleDateString(LOCALE, MONTH)}`
  }

  return tickDate.toLocaleDateString(LOCALE, isFirstTick ? { ...MONTH, ...YEAR } : MONTH)
}

const renderTickLabelYear = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, isFirstTick || is1stOfYear(tickDate) ? { ...MONTH, ...YEAR } : MONTH)
}

const renderTickLabelDecade = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, YEAR)
}

export const getGregorianStickyContextLabel = (scaleLevel: ScaleLevel, timeMs: number) => {
  const contextDate = new Date(timeMs)

  switch (scaleLevel) {
    case -1:
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
        ...YEAR,
      })
    case 0:
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
        ...YEAR,
      })
    case 1:
    case 2:
      return contextDate.toLocaleDateString(LOCALE, {
        ...MONTH,
        ...YEAR,
      })
    case 3:
      return contextDate.toLocaleDateString(LOCALE, {
        ...MONTH,
        ...YEAR,
      })
    case 4:
    case 5:
      return contextDate.toLocaleDateString(LOCALE, YEAR)
    case 6:
      return undefined
    default:
      return undefined
  }
}

export const GREGORIAN_SCALE_LEVEL_CONFIG: Record<ScaleLevel, ScaleLevelConfig> = {
  [-1]: {
    key: 'minute',
    label: 'Minute',
    visibleTicks: 61,
    unit: 'second',
    screenSpan: 61 * SECOND_IN_MS,
    calculateTickTimeFunc: addSeconds,
    startTickDateFunc: startOfMinute,
    renderTickLabel: renderTickLabelMinute,
  },
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute',
    screenSpan: 61 * MINUTE_IN_MS,
    calculateTickTimeFunc: addMinutes,
    startTickDateFunc: startOfHour,
    renderTickLabel: renderTickLabelHour,
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    screenSpan: 25 * HOUR_IN_MS,
    calculateTickTimeFunc: addHours,
    startTickDateFunc: startOfDay,
    renderTickLabel: renderTickLabelDay,
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    screenSpan: 8 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    startTickDateFunc: startOfWeek,
    renderTickLabel: renderTickLabelWeek,
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    screenSpan: 32 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    startTickDateFunc: startOfMonth,
    renderTickLabel: renderTickLabelMonth,
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    screenSpan: 120 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    startTickDateFunc: startOfQuarter,
    renderTickLabel: renderTickLabelQuarter,
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    screenSpan: 400 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    startTickDateFunc: startOfYear,
    renderTickLabel: renderTickLabelYear,
  },
  6: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    screenSpan: 4015 * DAY_IN_MS,
    calculateTickTimeFunc: addYears,
    startTickDateFunc: startOfDecade,
    renderTickLabel: renderTickLabelDecade,
  },
}
