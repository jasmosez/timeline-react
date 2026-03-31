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

export const getHebrewContainingPeriodStartTimeMs = (
  scaleLevel: number,
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayInfo = getHebrewDayInfo(timestamp, environment)

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

  if (scaleLevel === 5) {
    const yearStartHDate = new HDate(1, 7, dayInfo.hdate.getFullYear())
    return getStartOfHebrewHDate(yearStartHDate, environment).getTime()
  }

  return dayInfo.startsAtSunset.getTime()
}

export const getHebrewContainingPeriodEndTimeMs = (
  scaleLevel: number,
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayInfo = getHebrewDayInfo(timestamp, environment)

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

  if (scaleLevel === 5) {
    const nextYearStartHDate = new HDate(1, 7, dayInfo.hdate.getFullYear() + 1)
    return getStartOfHebrewHDate(nextYearStartHDate, environment).getTime()
  }

  return dayInfo.endsAtSunset.getTime()
}
