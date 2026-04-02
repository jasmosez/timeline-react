import { HDate, Location, Zmanim } from '@hebcal/core'

import type { TimelineEnvironment } from './layers'

export type HebrewDateIdentity = {
  year: number
  month: number
  monthName: string
  day: number
  label: string
}

export type HebrewDayInfo = {
  hdate: HDate
  hebrewDate: HebrewDateIdentity
  startsAtSunset: Date
  endsAtSunset: Date
}

const HEBREW_WEEKDAY_NAMES = [
  'Rishon',
  'Sheni',
  'Shlishi',
  "Revi'i",
  'Chamishi',
  'Shishi',
  'Shabbat',
]

const CIVIL_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

const getCivilDateFormatter = (timezone: string) => {
  const formatter = CIVIL_DATE_FORMATTERS.get(timezone)
  if (formatter) {
    return formatter
  }

  const nextFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  CIVIL_DATE_FORMATTERS.set(timezone, nextFormatter)
  return nextFormatter
}

const getCivilDateInTimezone = (timestamp: Date, timezone: string) => {
  const parts = getCivilDateFormatter(timezone).formatToParts(timestamp)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return new Date(Date.UTC(year, month - 1, day, 12))
}

export const createHebcalLocation = (environment: TimelineEnvironment) =>
  new Location(
    environment.location.latitude,
    environment.location.longitude,
    false,
    environment.timezone,
    `${environment.location.city}, ${environment.location.region} ${environment.location.postalCode}`,
    'US',
  )

export const getSunsetForCivilDate = (civilDate: Date, environment: TimelineEnvironment) => {
  const location = createHebcalLocation(environment)
  return new Zmanim(location, civilDate, false).sunset()
}

export const getStartOfHebrewHDate = (hdate: HDate, environment: TimelineEnvironment) => {
  const civilDate = hdate.greg()
  const previousCivilDate = new Date(civilDate)
  previousCivilDate.setDate(previousCivilDate.getDate() - 1)
  return getSunsetForCivilDate(previousCivilDate, environment)
}

const getHebrewDateIdentity = (hebrewDate: HDate): HebrewDateIdentity => ({
  year: hebrewDate.getFullYear(),
  month: hebrewDate.getMonth(),
  monthName: hebrewDate.getMonthName(),
  day: hebrewDate.getDate(),
  label: hebrewDate.render('en'),
})

export const getHebrewDayInfo = (timestamp: Date, environment: TimelineEnvironment): HebrewDayInfo => {
  const civilDate = getCivilDateInTimezone(timestamp, environment.timezone)
  const currentDaySunset = getSunsetForCivilDate(civilDate, environment)

  if (timestamp >= currentDaySunset) {
    const nextCivilDate = new Date(civilDate)
    nextCivilDate.setUTCDate(nextCivilDate.getUTCDate() + 1)
    const hdate = new HDate(nextCivilDate)

    return {
      hdate,
      hebrewDate: getHebrewDateIdentity(hdate),
      startsAtSunset: currentDaySunset,
      endsAtSunset: getSunsetForCivilDate(nextCivilDate, environment),
    }
  }

  const previousCivilDate = new Date(civilDate)
  previousCivilDate.setUTCDate(previousCivilDate.getUTCDate() - 1)
  const hdate = new HDate(civilDate)

  return {
    hdate,
    hebrewDate: getHebrewDateIdentity(hdate),
    startsAtSunset: getSunsetForCivilDate(previousCivilDate, environment),
    endsAtSunset: currentDaySunset,
  }
}

export const formatHebrewPrimaryNowLabel = (
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayInfo = getHebrewDayInfo(timestamp, environment)
  const weekdayName = HEBREW_WEEKDAY_NAMES[dayInfo.hdate.getDay()]
  const civilTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${weekdayName} • ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year} • ${civilTime}`
}

const HEBREW_QUARTER_START_MONTHS = [7, 10, 1, 4]

export const isHebrewQuarterStartMonth = (month: number) =>
  HEBREW_QUARTER_START_MONTHS.includes(month)

export const getHebrewQuarterStartMonth = (month: number) => {
  if (month >= 7 && month <= 9) {
    return 7
  }

  if (month >= 10) {
    return 10
  }

  if (month >= 1 && month <= 3) {
    return 1
  }

  return 4
}

export const getHebrewQuarterLabel = (year: number, startMonth: number) => {
  const isLeapYear = HDate.isLeapYear(year)
  const endMonth = startMonth === 7
    ? 9
    : startMonth === 10
      ? (isLeapYear ? 13 : 12)
      : startMonth === 1
        ? 3
        : 6

  const startMonthName = new HDate(1, startMonth, year).getMonthName()
  const endMonthName = new HDate(1, endMonth, year).getMonthName()

  return `${startMonthName}–${endMonthName} ${year}`
}

export const isHebrewShmitaYear = (year: number) => year % 7 === 0

export const getHebrewShmitaCycleStartYear = (year: number) => year - ((year - 1) % 7)

const getNextHebrewQuarterStartHDate = (startQuarterHDate: HDate) => {
  const month = startQuarterHDate.getMonth()
  const year = startQuarterHDate.getFullYear()

  if (month === 7) {
    return new HDate(1, 10, year)
  }

  if (month === 10) {
    return new HDate(1, 1, year)
  }

  if (month === 1) {
    return new HDate(1, 4, year)
  }

  return new HDate(1, 7, year + 1)
}

export const getHebrewContainingPeriodStartTimeMs = (
  scaleLevel: number,
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayInfo = getHebrewDayInfo(timestamp, environment)

  if (scaleLevel === -1) {
    const minuteStart = new Date(timestamp)
    minuteStart.setSeconds(0, 0)
    return minuteStart.getTime()
  }

  if (scaleLevel === 0) {
    const hourStart = new Date(timestamp)
    hourStart.setMinutes(0, 0, 0)
    return hourStart.getTime()
  }

  if (scaleLevel === 1) {
    return dayInfo.startsAtSunset.getTime()
  }

  if (scaleLevel === 2) {
    const weekStartHDate = dayInfo.hdate.onOrBefore(0)
    return getStartOfHebrewHDate(weekStartHDate, environment).getTime()
  }

  if (scaleLevel === 3) {
    const monthStartHDate = new HDate(1, dayInfo.hdate.getMonth(), dayInfo.hdate.getFullYear())
    return getStartOfHebrewHDate(monthStartHDate, environment).getTime()
  }

  if (scaleLevel === 4) {
    const quarterStartMonth = getHebrewQuarterStartMonth(dayInfo.hdate.getMonth())
    const quarterStartHDate = new HDate(1, quarterStartMonth, dayInfo.hdate.getFullYear())
    return getStartOfHebrewHDate(quarterStartHDate, environment).getTime()
  }

  if (scaleLevel === 5) {
    const yearStartHDate = new HDate(1, 7, dayInfo.hdate.getFullYear())
    return getStartOfHebrewHDate(yearStartHDate, environment).getTime()
  }

  if (scaleLevel === 6) {
    const shmitaCycleStartYear = getHebrewShmitaCycleStartYear(dayInfo.hdate.getFullYear())
    const shmitaCycleStartHDate = new HDate(1, 7, shmitaCycleStartYear)
    return getStartOfHebrewHDate(shmitaCycleStartHDate, environment).getTime()
  }

  return dayInfo.startsAtSunset.getTime()
}

export const getHebrewContainingPeriodEndTimeMs = (
  scaleLevel: number,
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayInfo = getHebrewDayInfo(timestamp, environment)

  if (scaleLevel === -1) {
    const minuteEnd = new Date(timestamp)
    minuteEnd.setSeconds(0, 0)
    minuteEnd.setMinutes(minuteEnd.getMinutes() + 1)
    return minuteEnd.getTime()
  }

  if (scaleLevel === 0) {
    const hourEnd = new Date(timestamp)
    hourEnd.setMinutes(0, 0, 0)
    hourEnd.setHours(hourEnd.getHours() + 1)
    return hourEnd.getTime()
  }

  if (scaleLevel === 1) {
    return dayInfo.endsAtSunset.getTime()
  }

  if (scaleLevel === 2) {
    let nextWeekStartHDate = dayInfo.hdate.onOrBefore(0)

    for (let i = 0; i < 7; i++) {
      nextWeekStartHDate = nextWeekStartHDate.next()
    }

    return getStartOfHebrewHDate(nextWeekStartHDate, environment).getTime()
  }

  if (scaleLevel === 3) {
    const monthStartHDate = new HDate(1, dayInfo.hdate.getMonth(), dayInfo.hdate.getFullYear())
    let nextMonthStartHDate = monthStartHDate.next()

    while (nextMonthStartHDate.getDate() !== 1) {
      nextMonthStartHDate = nextMonthStartHDate.next()
    }

    return getStartOfHebrewHDate(nextMonthStartHDate, environment).getTime()
  }

  if (scaleLevel === 4) {
    const quarterStartMonth = getHebrewQuarterStartMonth(dayInfo.hdate.getMonth())
    const quarterStartHDate = new HDate(1, quarterStartMonth, dayInfo.hdate.getFullYear())
    return getStartOfHebrewHDate(getNextHebrewQuarterStartHDate(quarterStartHDate), environment).getTime()
  }

  if (scaleLevel === 5) {
    const nextYearStartHDate = new HDate(1, 7, dayInfo.hdate.getFullYear() + 1)
    return getStartOfHebrewHDate(nextYearStartHDate, environment).getTime()
  }

  if (scaleLevel === 6) {
    const nextShmitaCycleStartYear = getHebrewShmitaCycleStartYear(dayInfo.hdate.getFullYear()) + 7
    const nextShmitaCycleStartHDate = new HDate(1, 7, nextShmitaCycleStartYear)
    return getStartOfHebrewHDate(nextShmitaCycleStartHDate, environment).getTime()
  }

  return dayInfo.endsAtSunset.getTime()
}
