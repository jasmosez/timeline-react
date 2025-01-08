import { LOCALE } from './config'

/**
 * Represents a zoom level configuration.
 * 
 * @typedef {Object} zoomLevel
 * @property {'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade'} key - The key representing the zoom level.
 * @property {string} label - The label for the zoom level.
 * @property {number} visibleTicks - The number of visible ticks for the zoom level.
 * @property {'minute' | 'hour' | 'day' | 'month' | 'year'} unit - The unit of time for the zoom level.
 * @property {number} screenSpan - The span of time in milliseconds for the screen.
 * @property {(firstTick: Date, addedUnits: number) => number} calculateTickTimeFunc - A function to calculate the time of a tick. The return number represents the calculated time in milliseconds.
 * @property {(date: Date) => Date} firstTickDateFunc - A function to determine the date of the first tick.
 * @property {number} renderTickLabel - A function to render the label for a tick at that level of zoom.
 */
type zoomLevel = {
    key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
    label: string,
    visibleTicks: number,
    unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
    screenSpan: number
    calculateTickTimeFunc: (firstTick: Date, addedUnits: number) => number
    firstTickDateFunc: (date: Date) => Date
    renderTickLabel: (tickTime: number, _isFirstTick: boolean) => string | undefined
  }

// Constants for time in milliseconds
const MINUTE_IN_MS = 60 * 1000
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

// Functions to add time to a date
const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * MINUTE_IN_MS

const addHours = (date: Date, hours: number) => date.getTime() + hours * HOUR_IN_MS

const addDays = (date: Date, days: number) => date.getTime() + days * DAY_IN_MS

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


// Functions to get the start of a time period for a date
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

// this is based on the gregorian calendar year (Q1 = Jan - Mar, etc.)
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

// for our purposes, we'll fudge it and define the shmita cycle as starting on the October 1st the year prior years divisible by 7
// const startOfShmitaFudged = (date: Date) => {
//   const newDate = new Date(date)
//   newDate.setHours(0)
//   newDate.setMinutes(0)
//   newDate.setSeconds(0)
//   newDate.setMilliseconds(0)
//   const year = date.getFullYear()
//   newDate.setFullYear(year - (year % 7) - 1)
//   newDate.setMonth(9)
//   newDate.setDate(1)
//   return newDate
// } 

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

// Constants for rendering tick labels
const MINUTE: Intl.DateTimeFormatOptions = { minute: '2-digit' }
const HOUR: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
const DAY: Intl.DateTimeFormatOptions = { day: 'numeric' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const MONTH: Intl.DateTimeFormatOptions = { month: 'short' }
const YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' }

const MONTH_WEEKDAY_DAY = {...MONTH, ...WEEKDAY, ...DAY}
export const FULL_DATE_FORMAT = {...YEAR, ...MONTH, ...WEEKDAY, ...DAY, ...HOUR, ...MINUTE}

const isMidnight = (tickDate: Date) => tickDate.getHours() === 0 && tickDate.getMinutes() === 0
const isTopOfHour = (tickDate: Date) => tickDate.getMinutes() === 0
const is3rdHour = (tickDate: Date) => tickDate.getHours() % 3 === 0
const is5thMin = (tickDate: Date) => tickDate.getMinutes() % 5 === 0
const is1stOfMonth = (tickDate: Date) => tickDate.getDate() === 1
// const isSunday = (tickDate: Date) => tickDate.getDay() === 0
const isSaturday = (tickDate: Date) => tickDate.getDay() === 6
const is1stOfYear = (tickDate: Date) => tickDate.getMonth() === 0 && tickDate.getDate() === 1
// Functions to render tick labels
const renderTickLabelHour = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)

  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, MONTH_WEEKDAY_DAY)} ${(isSaturday(tickDate) ? "✨" : "")}`
  }
  if (isTopOfHour(tickDate)) {
    return tickDate.toLocaleTimeString(LOCALE, HOUR)
  }
  if (is5thMin(tickDate)) {
    return `:${String(tickDate.getMinutes()).padStart(2, '0')}`
  }
}

const renderTickLabelDay = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  if (isMidnight(tickDate)) {
    return `${tickDate.toLocaleDateString(LOCALE, MONTH_WEEKDAY_DAY)} ${(isSaturday(tickDate) ? "✨" : "")}`
  }
  if (is3rdHour(tickDate)) {
    return tickDate.toLocaleTimeString(LOCALE, HOUR)
  }

}

// TODO: only render the month if it's the first day of the month or its the first tick
const renderTickLabelWeek = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  const showMonth = is1stOfMonth(tickDate)
  return `${tickDate.toLocaleDateString(LOCALE, (showMonth ? MONTH_WEEKDAY_DAY : {...WEEKDAY, ...DAY}))} ${(isSaturday(tickDate) ? "✨" : "")}`
}

// TODO: only render the month if it's the first day of the month or its the first tick
const renderTickLabelMonth = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return `${tickDate.toLocaleDateString(LOCALE, {...DAY, ...(_isFirstTick || is1stOfMonth(tickDate) ? MONTH : ""), ...is1stOfYear(tickDate) ? YEAR : "" })} ${(isSaturday(tickDate) ? "✨" : "")}`
}

// TODO: only render year if it's the first day of the year or its the first tick
const renderTickLabelQuarter = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, _isFirstTick ? {...MONTH, ...YEAR} : MONTH)
}

const renderTickLabelYear = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, _isFirstTick || is1stOfYear(tickDate) ? {...MONTH, ...YEAR} : MONTH)
}

// const renderTickLabelShmita = (tickTime: number, _isFirstTick: boolean) => {
//   const tickDate = new Date(tickTime)
//   return tickDate.toLocaleDateString(LOCALE, {...MONTH, ...YEAR})
// }

const renderTickLabelDecade = (tickTime: number, _isFirstTick: boolean) => {
  const tickDate = new Date(tickTime)
  return tickDate.toLocaleDateString(LOCALE, YEAR)
}



export const ZOOM: Record<number, zoomLevel> = {
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute',
    screenSpan: 61 * MINUTE_IN_MS,
    calculateTickTimeFunc: addMinutes,
    firstTickDateFunc: startOfHour,
    renderTickLabel: renderTickLabelHour
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    screenSpan: 25 * HOUR_IN_MS,
    calculateTickTimeFunc: addHours,
    firstTickDateFunc: startOfDay,
    renderTickLabel: renderTickLabelDay
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    screenSpan: 8 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    firstTickDateFunc: startOfWeek,
    renderTickLabel: renderTickLabelWeek
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    screenSpan: 32 * DAY_IN_MS,
    calculateTickTimeFunc: addDays,
    firstTickDateFunc: startOfMonth,
    renderTickLabel: renderTickLabelMonth
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    screenSpan: 120 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    firstTickDateFunc: startOfQuarter,
    renderTickLabel: renderTickLabelQuarter
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    screenSpan: 400 * DAY_IN_MS,
    calculateTickTimeFunc: addMonths,
    firstTickDateFunc: startOfYear,
    renderTickLabel: renderTickLabelYear
  },
  // 6: {
  //   key: 'shmita',
  //   label: 'Shmita Cycle',
  //   visibleTicks: 8,
  //   unit: 'year',
  //   screenSpan: 2920 * DAY_IN_MS,
  //   calculateTickTimeFunc: addYears,
  //   firstTickDateFunc: startOfShmitaFudged,
  //   renderTickLabel: renderTickLabelShmita
  // },
  // TODO: show quarter ticks in decade view
  6: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    screenSpan: 4015 * DAY_IN_MS,
    calculateTickTimeFunc: addYears,
    firstTickDateFunc: startOfDecade,
    renderTickLabel: renderTickLabelDecade
  }
}

// Get the max and min zoom levels
export const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))
export const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))

// Get the percentage of the screen for a point in time
export const getPointPercent = (pointTime: number, zoom: keyof typeof ZOOM, firstTickDate: Date) => {
  const {calculateTickTimeFunc, screenSpan, visibleTicks} = ZOOM[zoom]
  
  const firstTickOffsetPecentage = (100/visibleTicks)/2
  const firstTickOffsetMs = screenSpan * firstTickOffsetPecentage/100
  const screenStartTime = calculateTickTimeFunc(firstTickDate, 0) - firstTickOffsetMs
  const timeSinceStart = pointTime - screenStartTime;
  const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100;
  return `${percentageOfScreenSpan}%`
}