import { getHebrewDayInfo } from './hebrewTime'
import type { TimelineEnvironment } from './layers'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const CIVIL_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

const getCivilDateFormatter = (timezone: string) => {
  const existing = CIVIL_DATE_FORMATTERS.get(timezone)
  if (existing) {
    return existing
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  CIVIL_DATE_FORMATTERS.set(timezone, formatter)
  return formatter
}

const CIVIL_DATETIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

const getCivilDateTimeFormatter = (timezone: string) => {
  const existing = CIVIL_DATETIME_FORMATTERS.get(timezone)
  if (existing) {
    return existing
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  CIVIL_DATETIME_FORMATTERS.set(timezone, formatter)
  return formatter
}

type CivilDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const getCivilDateTimeParts = (date: Date, timezone: string): CivilDateTimeParts => {
  const parts = getCivilDateTimeFormatter(timezone).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
    hour: Number(parts.find((part) => part.type === 'hour')?.value),
    minute: Number(parts.find((part) => part.type === 'minute')?.value),
  }
}

const parseDateTimeInputValue = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!match) {
    return undefined
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  }
}

export const formatDateTimeInputValueForTimezone = (date: Date, timezone: string) => {
  const { year, month, day, hour, minute } = getCivilDateTimeParts(date, timezone)

  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-') + `T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export const parseDateTimeInputValueInTimezone = (value: string, timezone: string) => {
  const desired = parseDateTimeInputValue(value)
  if (!desired) {
    return undefined
  }

  let utcMillis = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
  )

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = getCivilDateTimeParts(new Date(utcMillis), timezone)
    const desiredEquivalent = Date.UTC(
      desired.year,
      desired.month - 1,
      desired.day,
      desired.hour,
      desired.minute,
    )
    const actualEquivalent = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
    )
    const diff = desiredEquivalent - actualEquivalent

    if (diff === 0) {
      return new Date(utcMillis)
    }

    utcMillis += diff
  }

  return new Date(utcMillis)
}

const getCivilDateOrdinal = (timestamp: Date, timezone: string) => {
  const parts = getCivilDateFormatter(timezone).formatToParts(timestamp)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS)
}

export const getPersonalDayOfLife = (
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const targetOrdinal = getCivilDateOrdinal(timestamp, environment.timezone)
  const birthOrdinal = getCivilDateOrdinal(environment.birthDate, environment.timezone)
  const offset = targetOrdinal - birthOrdinal

  if (offset < 0) {
    return undefined
  }

  return offset + 1
}

export const getPersonalWeekOfLife = (
  timestamp: Date,
  environment: TimelineEnvironment,
) => {
  const dayOfLife = getPersonalDayOfLife(timestamp, environment)

  if (dayOfLife === undefined) {
    return undefined
  }

  return Math.floor((dayOfLife - 1) / 7) + 1
}

type PersonalLabelOptions = {
  label: string | undefined
  timeMs: number
  environment: TimelineEnvironment
  isLeading: boolean
  includeDayOfLife: boolean
  includeWeekOfLife: boolean
}

export const augmentLabelWithPersonalTime = ({
  label,
  timeMs,
  environment,
  isLeading,
  includeDayOfLife,
  includeWeekOfLife,
}: PersonalLabelOptions) => {
  if (!label) {
    return label
  }

  const timestamp = new Date(timeMs)
  const leadingParts: string[] = []
  const supportingParts: string[] = []

  if (includeWeekOfLife) {
    const weekOfLife = getPersonalWeekOfLife(timestamp, environment)
    if (weekOfLife !== undefined) {
      leadingParts.push(`Week ${weekOfLife}`)
      supportingParts.unshift(`Week ${weekOfLife}`)
    }
  }

  if (includeDayOfLife) {
    const dayOfLife = getPersonalDayOfLife(timestamp, environment)
    if (dayOfLife !== undefined) {
      leadingParts.push(`Day ${dayOfLife}`)
      supportingParts.unshift(`Day ${dayOfLife}`)
    }
  }

  const personalParts = isLeading ? leadingParts : supportingParts
  if (personalParts.length === 0) {
    return label
  }

  return isLeading
    ? `${personalParts.join(', ')} - ${label}`
    : `${label} - ${personalParts.join(', ')}`
}

export const getDerivedHebrewBirthDateLabel = (environment: TimelineEnvironment) =>
  (() => {
    const hebrewDate = getHebrewDayInfo(environment.birthDate, environment).hebrewDate
    return `${hebrewDate.day} ${hebrewDate.monthName} ${hebrewDate.year}`
  })()
