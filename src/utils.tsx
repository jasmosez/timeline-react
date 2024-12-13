type zoomLevel = {
    key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
    label: string,
    visibleTicks: number,
    unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
    incrementFunc: (firstTick: Date, i: number) => number
    firstTickFunc: (date: Date) => Date
  }
  
const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * 60 * 1000

const addHours = (date: Date, hours: number) => date.getTime() + hours * 60 * 60 * 1000

const addDays = (date: Date, days: number) => date.getTime() + days * 24 * 60 * 60 * 1000

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
    incrementFunc: addMinutes,
    firstTickFunc: startOfHour
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    incrementFunc: addHours,
    firstTickFunc: startOfDay
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    incrementFunc: addDays,
    firstTickFunc: startOfWeek
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    incrementFunc: addDays,
    firstTickFunc: startOfMonth
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    incrementFunc: addMonths,
    firstTickFunc: startOfQuarter
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    incrementFunc: addMonths,
    firstTickFunc: startOfYear
  },
  6: {
    key: 'shmita',
    label: 'Shmita Cycle',
    visibleTicks: 8,
    unit: 'year',
    incrementFunc: addYears,
    firstTickFunc: startOfShmitaFudged
  },
  7: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    incrementFunc: addYears,
    firstTickFunc: startOfDecade
  }
}

export const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))

export const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))
