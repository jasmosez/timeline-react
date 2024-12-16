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
 */
type zoomLevel = {
    key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
    label: string,
    visibleTicks: number,
    unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
    screenSpan: number
    calculateTickTimeFunc: (firstTick: Date, addedUnits: number) => number
    firstTickDateFunc: (date: Date) => Date
  }

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * MINUTE

const addHours = (date: Date, hours: number) => date.getTime() + hours * HOUR

const addDays = (date: Date, days: number) => date.getTime() + days * DAY

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

// get start of hour for a datetime
const startOfHour = (date: Date) => {
  const newDate = new Date(date)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

// get start of day for a datetime
const startOfDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

// get start of week for a datetime
const startOfWeek = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setDate(date.getDate() - date.getDay())
  return newDate
}

// get start of month for a datetime
const startOfMonth = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  newDate.setDate(1)
  return newDate
}

// get start of quarter for a datetime
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

// get start of year for a datetime
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

// get start of shmita cycle for a datetime. 
// for our purposes, we'll fudge it and define the shmita cycle as starting on the October 1st the year prior years divisible by 7
const startOfShmitaFudged = (date: Date) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  const year = date.getFullYear()
  newDate.setFullYear(year - (year % 7) - 1)
  newDate.setMonth(9)
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


export const ZOOM: Record<number, zoomLevel> = {
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute',
    screenSpan: 61 * MINUTE,
    calculateTickTimeFunc: addMinutes,
    firstTickDateFunc: startOfHour
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    screenSpan: 25 * HOUR,
    calculateTickTimeFunc: addHours,
    firstTickDateFunc: startOfDay
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    screenSpan: 8 * DAY,
    calculateTickTimeFunc: addDays,
    firstTickDateFunc: startOfWeek
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    screenSpan: 32 * DAY,
    calculateTickTimeFunc: addDays,
    firstTickDateFunc: startOfMonth
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    screenSpan: 120 * DAY,
    calculateTickTimeFunc: addMonths,
    firstTickDateFunc: startOfQuarter
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    screenSpan: 400 * DAY,
    calculateTickTimeFunc: addMonths,
    firstTickDateFunc: startOfYear
  },
  6: {
    key: 'shmita',
    label: 'Shmita Cycle',
    visibleTicks: 8,
    unit: 'year',
    screenSpan: 2920 * DAY,
    calculateTickTimeFunc: addYears,
    firstTickDateFunc: startOfShmitaFudged
  },
  7: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    screenSpan: 4015 * DAY,
    calculateTickTimeFunc: addYears,
    firstTickDateFunc: startOfDecade
  }
}

export const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))

export const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))

export const getPointPercent = (pointTime: number, zoom: keyof typeof ZOOM, firstTickDate: Date) => {
  const {calculateTickTimeFunc, screenSpan, visibleTicks} = ZOOM[zoom]
  
  const firstTickOffsetPecentage = (100/visibleTicks)/2
  const firstTickOffsetMs = screenSpan * firstTickOffsetPecentage/100
  const screenStartTime = calculateTickTimeFunc(firstTickDate, 0) - firstTickOffsetMs
  const timeSinceStart = pointTime - screenStartTime;
  const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100;
  return `${percentageOfScreenSpan}%`
}