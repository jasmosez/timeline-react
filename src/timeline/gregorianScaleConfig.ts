import type { ScaleLevel, ScaleLevelConfig } from './scales'
import {
  getGregorianContextLabel,
  getGregorianDayTickLabel,
  getGregorianDecadeTickLabel,
  getGregorianHourTickLabel,
  getGregorianMinuteTickLabel,
  getGregorianMonthTickLabel,
  getGregorianQuarterTickLabel,
  getGregorianWeekTickLabel,
  getGregorianYearTickLabel,
} from './gregorianLabels'

const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

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

export { getGregorianContextLabel }
export const getGregorianStickyContextLabel = getGregorianContextLabel

export const GREGORIAN_SCALE_LEVEL_CONFIG: Record<ScaleLevel, ScaleLevelConfig> = {
  [-1]: {
    key: 'minute',
    label: 'Minute',
    visibleTicks: 61,
    unit: 'second',
    screenSpan: 61 * SECOND_IN_MS,
    calculateTickTimeFunc: addSeconds,
    startTickDateFunc: startOfMinute,
    getTickLabel: getGregorianMinuteTickLabel,
  },
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute',
    screenSpan: 61 * MINUTE_IN_MS,
    calculateTickTimeFunc: addMinutes,
    startTickDateFunc: startOfHour,
    getTickLabel: getGregorianHourTickLabel,
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    screenSpan: 25 * HOUR_IN_MS,
    calculateTickTimeFunc: addHours,
    startTickDateFunc: startOfDay,
    getTickLabel: getGregorianDayTickLabel,
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    screenSpan: 8 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    startTickDateFunc: startOfWeek,
    getTickLabel: getGregorianWeekTickLabel,
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    screenSpan: 32 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    startTickDateFunc: startOfMonth,
    getTickLabel: getGregorianMonthTickLabel,
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    screenSpan: 120 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    startTickDateFunc: startOfQuarter,
    getTickLabel: getGregorianQuarterTickLabel,
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    screenSpan: 400 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    startTickDateFunc: startOfYear,
    getTickLabel: getGregorianYearTickLabel,
  },
  6: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    screenSpan: 4015 * DAY_IN_MS,
    calculateTickTimeFunc: addYears,
    startTickDateFunc: startOfDecade,
    getTickLabel: getGregorianDecadeTickLabel,
  },
}
