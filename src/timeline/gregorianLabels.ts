import { LOCALE } from '../config'
import type { ScaleLevel } from './scales'

const SECOND: Intl.DateTimeFormatOptions = { second: '2-digit' }
const MINUTE: Intl.DateTimeFormatOptions = { minute: '2-digit' }
const HOUR: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
const HOUR_MINUTE: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
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
const is5thSec = (tickDate: Date) => tickDate.getSeconds() % 5 === 0
const isTopOfMinute = (tickDate: Date) => tickDate.getSeconds() === 0
const hasTimezoneOffsetChange = (tickDate: Date) =>
  tickDate.getTimezoneOffset() !== new Date(addHours(tickDate, -1)).getTimezoneOffset()
const repeatsPreviousLocalHour = (tickDate: Date) => {
  const previousHour = new Date(addHours(tickDate, -1))

  return tickDate.getHours() === previousHour.getHours()
    && tickDate.getMinutes() === previousHour.getMinutes()
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

const getIsoWeekInfo = (date: Date) => {
  const localDate = new Date(date)
  localDate.setHours(0, 0, 0, 0)
  localDate.setDate(localDate.getDate() + 3 - ((localDate.getDay() + 6) % 7))
  const weekYear = localDate.getFullYear()
  const weekOne = new Date(weekYear, 0, 4)
  weekOne.setHours(0, 0, 0, 0)

  const weekNumber = 1 + Math.round(
    (
      localDate.getTime()
      - weekOne.getTime()
      - (3 - ((weekOne.getDay() + 6) % 7)) * DAY_IN_MS
    ) / (7 * DAY_IN_MS),
  )

  return { weekYear, weekNumber }
}

export const getSundayStartWeekInfo = (date: Date) => {
  const shiftedDate = new Date(date)
  shiftedDate.setDate(shiftedDate.getDate() + 1)
  return getIsoWeekInfo(shiftedDate)
}

const formatWeekNumber = (date: Date) => `W${getSundayStartWeekInfo(date).weekNumber}`

const formatHourWithOptionalTimezone = (tickDate: Date) =>
  tickDate.toLocaleTimeString(
    LOCALE,
    hasTimezoneOffsetChange(tickDate) || repeatsPreviousLocalHour(tickDate)
      ? { ...HOUR, timeZoneName: 'short' }
      : HOUR,
  )

const formatHourMinuteWithOptionalTimezone = (tickDate: Date) =>
  tickDate.toLocaleTimeString(
    LOCALE,
    hasTimezoneOffsetChange(tickDate) || repeatsPreviousLocalHour(tickDate)
      ? { ...HOUR_MINUTE, timeZoneName: 'short' }
      : HOUR_MINUTE,
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
  if (is5thSec(tickDate)) {
    return `:${String(tickDate.getSeconds()).padStart(2, '0')}`
  }
}

export const getGregorianHourTickLabel = (tickTime: number) => {
  const tickDate = new Date(tickTime)

  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR_MINUTE)}`
  }
  if (isTopOfHour(tickDate)) {
    return formatHourMinuteWithOptionalTimezone(tickDate)
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

  if (tickDate.getDay() === 0) {
    return `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
  }

  return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
}

export const getGregorianMonthTickLabel = (tickTime: number, isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  const showMonth = isFirstTick || is1stOfMonth(tickDate)
  const showYear = is1stOfYear(tickDate)
  const isSunday = tickDate.getDay() === 0

  if (isSunday && showMonth) {
    return `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, {
      ...DAY,
      ...MONTH,
      ...(showYear ? YEAR : {}),
    })}`
  }

  if (isSunday && !showYear) {
    return `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, DAY)}`
  }

  return tickDate.toLocaleDateString(LOCALE, {
    ...DAY,
    ...(showMonth ? MONTH : {}),
    ...(showYear ? YEAR : {}),
  })
}

export const getGregorianQuarterWeekTickLabel = (tickTime: number) => {
  return formatWeekNumber(new Date(tickTime))
}

export const getGregorianQuarterBoundaryLabel = (tickTime: number, isPrimary = true) => {
  const tickDate = new Date(tickTime)

  if (isStartOfQuarter(tickDate)) {
    const quarterLabel = `Q${Math.floor(tickDate.getMonth() / 3) + 1}`
    const monthLabel = tickDate.toLocaleDateString(LOCALE, MONTH)
    return isPrimary ? `${quarterLabel}, ${monthLabel}` : `${monthLabel}, ${quarterLabel}`
  }

  return tickDate.toLocaleDateString(LOCALE, MONTH)
}

export const getGregorianStructuralTickLabel = (
  scaleLevel: ScaleLevel,
  tickTime: number,
  isFirstTick: boolean,
  isPrimary = true,
) => {
  const tickDate = new Date(tickTime)

  if (scaleLevel === -1) {
    if (!isPrimary && isMidnight(tickDate)) {
      return `${tickDate.toLocaleTimeString(LOCALE, HOUR_MINUTE)}, ${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}`
    }

    return getGregorianMinuteTickLabel(tickTime, isFirstTick)
  }

  if (scaleLevel === 0) {
    if (!isPrimary && isMidnight(tickDate)) {
      return `${tickDate.toLocaleTimeString(LOCALE, HOUR_MINUTE)}, ${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}`
    }

    return getGregorianHourTickLabel(tickTime)
  }

  if (scaleLevel === 1) {
    if (!isPrimary && isMidnight(tickDate)) {
      return `${tickDate.toLocaleTimeString(LOCALE, HOUR)}, ${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}`
    }

    return getGregorianDayTickLabel(tickTime)
  }

  if (scaleLevel === 2) {
    if (!isPrimary && tickDate.getDay() === 0) {
      return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${formatWeekNumber(tickDate)}`
    }

    return getGregorianWeekTickLabel(tickTime)
  }

  if (scaleLevel === 3) {
    const showMonth = isFirstTick || is1stOfMonth(tickDate)
    const showYear = is1stOfYear(tickDate)
    const isSunday = tickDate.getDay() === 0

    if (!isPrimary && isSunday && showMonth) {
      return `${tickDate.toLocaleDateString(LOCALE, {
        ...DAY,
        ...MONTH,
        ...(showYear ? YEAR : {}),
      })}, ${formatWeekNumber(tickDate)}`
    }

    if (!isPrimary && isSunday && !showYear) {
      return `${tickDate.toLocaleDateString(LOCALE, DAY)}, ${formatWeekNumber(tickDate)}`
    }

    return getGregorianMonthTickLabel(tickTime, isFirstTick)
  }

  if (scaleLevel === 4) {
    return getGregorianQuarterWeekTickLabel(tickTime)
  }

  if (scaleLevel === 5) {
    const monthLabel = tickDate.toLocaleDateString(LOCALE, MONTH)
    if (is1stOfYear(tickDate)) {
      const yearLabel = tickDate.toLocaleDateString(LOCALE, YEAR)
      return isPrimary ? `${yearLabel}, ${monthLabel}` : `${monthLabel} ${yearLabel}`
    }

    return monthLabel
  }

  if (scaleLevel === 6) {
    return getGregorianDecadeTickLabel(tickTime)
  }

  return undefined
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
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
      }) + `, ${contextDate.toLocaleTimeString(LOCALE, { ...HOUR, ...MINUTE })}`
    case 0:
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
      }) + `, ${contextDate.toLocaleTimeString(LOCALE, HOUR)}`
    case 1:
      return contextDate.toLocaleDateString(LOCALE, {
        ...WEEKDAY,
        ...MONTH,
        ...DAY,
        ...YEAR,
      })
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
