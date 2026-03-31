import { LOCALE } from '../config'
import type { ScaleLevel } from './scales'

const SECOND: Intl.DateTimeFormatOptions = { second: '2-digit' }
const MINUTE: Intl.DateTimeFormatOptions = { minute: '2-digit' }
const HOUR: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
const DAY: Intl.DateTimeFormatOptions = { day: 'numeric' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const MONTH: Intl.DateTimeFormatOptions = { month: 'short' }
const YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' }

const HOUR_IN_MS = 60 * 60 * 1000

const addHours = (date: Date, hours: number) => date.getTime() + hours * HOUR_IN_MS

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

export const getGregorianMinuteTickLabel = (tickTime: number, isFirstTick: boolean) => {
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

export const getGregorianHourTickLabel = (tickTime: number) => {
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

export const getGregorianDayTickLabel = (tickTime: number) => {
  const tickDate = new Date(tickTime)

  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR)}`
  }
  if (is3rdHour(tickDate)) {
    return formatHourWithOptionalTimezone(tickDate)
  }
}

export const getGregorianWeekTickLabel = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
}

export const getGregorianMonthTickLabel = (tickTime: number, isFirstTick: boolean) => {
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

export const getGregorianQuarterTickLabel = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)

  if (isStartOfQuarter(tickDate)) {
    return `Q${Math.floor(tickDate.getMonth() / 3) + 1}, ${tickDate.toLocaleDateString(LOCALE, MONTH)}`
  }

  return tickDate.toLocaleDateString(LOCALE, isFirstTick ? { ...MONTH, ...YEAR } : MONTH)
}

export const getGregorianYearTickLabel = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, isFirstTick || is1stOfYear(tickDate) ? { ...MONTH, ...YEAR } : MONTH)
}

export const getGregorianDecadeTickLabel = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, YEAR)
}

export const getGregorianContextLabel = (scaleLevel: ScaleLevel, timeMs: number) => {
  const contextDate = new Date(timeMs)

  switch (scaleLevel) {
    case -1:
    case 0:
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
        ...YEAR,
      })
    case 1:
    case 2:
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
