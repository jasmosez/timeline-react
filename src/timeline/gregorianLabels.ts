import { LOCALE } from '../config'
import type { GregorianStructuralLabelStrategy } from './structuralExpressionPolicy'
import type { ScaleLevel } from './scales'

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
const formatQuarterNumber = (date: Date) => `Q${Math.floor(date.getMonth() / 3) + 1}`

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

export const getGregorianMinuteTickLabel = (tickTime: number, _isFirstTick: boolean) => {
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

export const getGregorianMonthTickLabel = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  const showMonth = is1stOfMonth(tickDate)
  const isSunday = tickDate.getDay() === 0
  const quarterLabel = isStartOfQuarter(tickDate) ? formatQuarterNumber(tickDate) : undefined

  if (isSunday && showMonth) {
    const label = `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, {
      ...DAY,
      ...MONTH,
    })}`
    return quarterLabel ? `${quarterLabel}, ${label}` : label
  }

  if (isSunday) {
    return `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, DAY)}`
  }

  const label = tickDate.toLocaleDateString(LOCALE, {
    ...DAY,
    ...(showMonth ? MONTH : {}),
  })

  return quarterLabel && showMonth ? `${quarterLabel}, ${label}` : label
}

export const getGregorianSupportingMonthTickLabel = (
  tickTime: number,
  isFirstTick: boolean,
) => {
  const tickDate = new Date(tickTime)
  const showMonth = is1stOfMonth(tickDate)
  const isSunday = tickDate.getDay() === 0
  const quarterLabel = isStartOfQuarter(tickDate) ? formatQuarterNumber(tickDate) : undefined

  if (isFirstTick && !showMonth && !isSunday) {
    return tickDate.toLocaleDateString(LOCALE, DAY)
  }

  if (isSunday && showMonth) {
    const label = `${tickDate.toLocaleDateString(LOCALE, {
      ...DAY,
      ...MONTH,
    })}, ${formatWeekNumber(tickDate)}`
    return quarterLabel ? `${label}, ${quarterLabel}` : label
  }

  if (isSunday) {
    return `${tickDate.toLocaleDateString(LOCALE, DAY)}, ${formatWeekNumber(tickDate)}`
  }

  if (showMonth) {
    const label = `${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, MONTH)}`
    return quarterLabel ? `${label}, ${quarterLabel}` : label
  }

  return tickDate.toLocaleDateString(LOCALE, DAY)
}

export const getGregorianQuarterWeekTickLabel = (tickTime: number) => {
  return formatWeekNumber(new Date(tickTime))
}

export const getGregorianQuarterBoundaryLabel = (tickTime: number, isPrimary = true) => {
  const tickDate = new Date(tickTime)
  const monthLabel = tickDate.toLocaleDateString(LOCALE, MONTH)
  const weekLabel = tickDate.getDay() === 0 ? formatWeekNumber(tickDate) : undefined

  if (isStartOfQuarter(tickDate)) {
    const quarterLabel = `Q${Math.floor(tickDate.getMonth() / 3) + 1}`
    if (weekLabel) {
      return isPrimary
        ? `${quarterLabel}, ${monthLabel}, ${weekLabel}`
        : `${weekLabel}, ${monthLabel}, ${quarterLabel}`
    }

    return isPrimary ? `${quarterLabel}, ${monthLabel}` : `${monthLabel}, ${quarterLabel}`
  }

  if (weekLabel) {
    return isPrimary ? `${monthLabel}, ${weekLabel}` : `${weekLabel}, ${monthLabel}`
  }

  return monthLabel
}

export const getGregorianYearBoundaryLabel = (
  tickTime: number,
  isPrimary = true,
) => {
  const tickDate = new Date(tickTime)
  const monthLabel = tickDate.toLocaleDateString(LOCALE, MONTH)

  if (is1stOfYear(tickDate)) {
    const yearLabel = tickDate.toLocaleDateString(LOCALE, YEAR)
    return isPrimary ? `${yearLabel}, ${monthLabel}` : `${monthLabel} ${yearLabel}`
  }

  return monthLabel
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
    if (tickDate.getHours() === 0 && tickDate.getDay() === 0) {
      const timeLabel = tickDate.toLocaleTimeString(LOCALE, HOUR)
      const dayLabel = tickDate.toLocaleDateString(LOCALE, DAY)
      const weekdayLabel = tickDate.toLocaleDateString(LOCALE, WEEKDAY)
      const weekLabel = formatWeekNumber(tickDate)

      return isPrimary
        ? `${weekLabel}, ${weekdayLabel} ${dayLabel}, ${timeLabel}`
        : `${timeLabel}, ${dayLabel} ${weekdayLabel}, ${weekLabel}`
    }

    if (!isPrimary && isMidnight(tickDate)) {
      return `${tickDate.toLocaleTimeString(LOCALE, HOUR)}, ${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}`
    }

    return getGregorianDayTickLabel(tickTime)
  }

  if (scaleLevel === 2) {
    if (!isPrimary && tickDate.getDay() === 0) {
      return `${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}, ${formatWeekNumber(tickDate)}`
    }

    if (!isPrimary) {
      return `${tickDate.toLocaleDateString(LOCALE, DAY)} ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)}`
    }

    return getGregorianWeekTickLabel(tickTime)
  }

  if (scaleLevel === 3) {
    if (!isPrimary) {
      return getGregorianSupportingMonthTickLabel(tickTime, isFirstTick)
    }

    return getGregorianMonthTickLabel(tickTime, isFirstTick)
  }

  if (scaleLevel === 4) {
    return getGregorianQuarterWeekTickLabel(tickTime)
  }

  if (scaleLevel === 5) {
    return getGregorianYearBoundaryLabel(tickTime, isPrimary)
  }

  if (scaleLevel === 6) {
    return getGregorianDecadeTickLabel(tickTime)
  }

  return undefined
}

export const getGregorianYearTickLabel = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, is1stOfYear(tickDate) ? { ...MONTH, ...YEAR } : MONTH)
}

export const getGregorianDecadeTickLabel = (tickTime: number) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, YEAR)
}

export const renderGregorianStructuralLabelStrategy = (
  labelStrategy: GregorianStructuralLabelStrategy,
  tickTime: number,
  isPrimary: boolean,
) => {
  const tickDate = new Date(tickTime)

  switch (labelStrategy) {
    case 'minute-view-five-second':
      return `:${String(tickDate.getSeconds()).padStart(2, '0')}`
    case 'minute-view-minute-boundary':
      return tickDate.toLocaleTimeString(LOCALE, { ...HOUR, ...MINUTE })
    case 'minute-view-hour-boundary':
      return tickDate.toLocaleTimeString(LOCALE, HOUR)
    case 'minute-view-day-boundary':
      return tickDate.toLocaleDateString(LOCALE, { ...WEEKDAY, ...DAY, ...HOUR })
    case 'hour-view-five-minute':
      return `:${String(tickDate.getMinutes()).padStart(2, '0')}`
    case 'hour-view-hour-boundary':
      return formatHourMinuteWithOptionalTimezone(tickDate)
    case 'hour-view-day-boundary':
      return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR_MINUTE)}`
    case 'day-view-third-hour':
      return formatHourWithOptionalTimezone(tickDate)
    case 'day-view-day-boundary':
      return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}, ${tickDate.toLocaleTimeString(LOCALE, HOUR)}`
    case 'day-view-week-boundary': {
      const timeLabel = tickDate.toLocaleTimeString(LOCALE, HOUR)
      const dayLabel = tickDate.toLocaleDateString(LOCALE, DAY)
      const weekdayLabel = tickDate.toLocaleDateString(LOCALE, WEEKDAY)
      const weekLabel = formatWeekNumber(tickDate)

      return isPrimary
        ? `${weekLabel}, ${weekdayLabel} ${dayLabel}, ${timeLabel}`
        : `${timeLabel}, ${dayLabel} ${weekdayLabel}, ${weekLabel}`
    }
    case 'week-view-ordinary-day':
      return `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
    case 'week-view-week-boundary':
      return `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
    case 'week-view-month-boundary':
      return tickDate.getDay() === 0
        ? `${formatWeekNumber(tickDate)}, ${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
        : `${tickDate.toLocaleDateString(LOCALE, WEEKDAY)} ${tickDate.toLocaleDateString(LOCALE, DAY)}`
    case 'month-view-context-boundary':
      return isPrimary
        ? getGregorianMonthTickLabel(tickTime, false) ?? ''
        : getGregorianSupportingMonthTickLabel(tickTime, false) ?? ''
    case 'quarter-view-week-boundary':
      return getGregorianQuarterWeekTickLabel(tickTime)
    case 'quarter-view-month-boundary-leading':
      return getGregorianQuarterBoundaryLabel(tickTime, true)
    case 'quarter-view-month-boundary-supporting':
      return getGregorianQuarterBoundaryLabel(tickTime, false)
    case 'year-view-year-boundary':
      return getGregorianYearBoundaryLabel(tickTime, isPrimary)
    case 'year-view-month-boundary':
      return new Date(tickTime).toLocaleDateString(LOCALE, MONTH)
    default:
      return ''
  }
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
      return `${formatWeekNumber(contextDate)}, ${contextDate.toLocaleDateString(LOCALE, {
        ...MONTH,
        ...YEAR,
      })}`
    case 3:
      return contextDate.toLocaleDateString(LOCALE, {
        ...MONTH,
        ...YEAR,
      })
    case 4:
      return `${formatQuarterNumber(contextDate)}, ${contextDate.toLocaleDateString(LOCALE, YEAR)}`
    case 5:
      return contextDate.toLocaleDateString(LOCALE, YEAR)
    case 6:
      return undefined
    default:
      return undefined
  }
}
