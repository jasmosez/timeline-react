import type { HebrewDayInfo } from './hebrewTime'
import { getHebrewDayInfo } from './hebrewTime'
import type { TimelineEnvironment } from './layers'

const HEBREW_WEEKDAY_NAMES = [
  'Rishon',
  'Sheni',
  'Shlishi',
  "Revi'i",
  'Chamishi',
  'Shishi',
  'Shabbat',
]

const formatCivilTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const formatCivilTimeWithSeconds = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

const formatCivilHour = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  })

export const getHebrewWeekdayName = (dayInfo: HebrewDayInfo) =>
  HEBREW_WEEKDAY_NAMES[dayInfo.hdate.getDay()]

const isShmitaYear = (year: number) => year % 7 === 0

const getHebrewQuarterNumber = (month: number) => {
  if (month >= 7 && month <= 9) {
    return 1
  }

  if (month >= 10) {
    return 2
  }

  if (month >= 1 && month <= 3) {
    return 3
  }

  return 4
}

export const getHebrewTickLabel = (
  activeScaleLevel: number,
  dayInfo: HebrewDayInfo,
  boundaryTimeMs: number,
) => {
  const weekdayName = getHebrewWeekdayName(dayInfo)
  const boundaryTime = new Date(boundaryTimeMs)

  if (activeScaleLevel === -1) {
    return `${weekdayName} ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilTimeWithSeconds(boundaryTime)}`
  }

  if (activeScaleLevel === 0 || activeScaleLevel === 1) {
    return `${weekdayName} ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilTime(boundaryTime)}`
  }

  if (activeScaleLevel === 2) {
    if (dayInfo.hebrewDate.day === 1) {
      return `${weekdayName} 1 ${dayInfo.hebrewDate.monthName}`
    }

    return `${weekdayName} ${dayInfo.hebrewDate.day}`
  }

  if (activeScaleLevel === 3) {
    if (dayInfo.hebrewDate.day === 1) {
      return `1 ${dayInfo.hebrewDate.monthName}`
    }

    if (weekdayName === 'Shabbat') {
      return `Shabbat ${dayInfo.hebrewDate.day}`
    }

    return String(dayInfo.hebrewDate.day)
  }

  if (activeScaleLevel === 4) {
    if (dayInfo.hebrewDate.day === 1) {
      const quarterNumber = getHebrewQuarterNumber(dayInfo.hebrewDate.month)
      const quarterStartMonths = new Set([7, 10, 1, 4])

      if (quarterStartMonths.has(dayInfo.hebrewDate.month)) {
        return `Q${quarterNumber}, ${dayInfo.hebrewDate.monthName}`
      }

      return dayInfo.hebrewDate.monthName
    }

    return undefined
  }

  if (activeScaleLevel === 5) {
    if (dayInfo.hebrewDate.day === 1) {
      if (dayInfo.hebrewDate.month === 7) {
        return `${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
      }

      return dayInfo.hebrewDate.monthName
    }

    return undefined
  }

  if (activeScaleLevel === 6) {
    return isShmitaYear(dayInfo.hebrewDate.year)
      ? `${dayInfo.hebrewDate.year}, Shmita`
      : String(dayInfo.hebrewDate.year)
  }

  return dayInfo.hebrewDate.label
}

export const getHebrewContextLabel = (
  activeScaleLevel: number,
  timeMs: number,
  environment: TimelineEnvironment,
) => {
  const time = new Date(timeMs)
  const dayInfo = getHebrewDayInfo(time, environment)
  const weekdayName = getHebrewWeekdayName(dayInfo)

  if (activeScaleLevel === -1) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilTime(time)}`
  }

  if (activeScaleLevel === 0) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilHour(time)}`
  }

  if (activeScaleLevel === 1) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
  }

  if (activeScaleLevel === 2 || activeScaleLevel === 3) {
    return `${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
  }

  if (activeScaleLevel === 4 || activeScaleLevel === 5) {
    return String(dayInfo.hebrewDate.year)
  }

  return undefined
}
