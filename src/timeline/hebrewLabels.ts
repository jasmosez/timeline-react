import type { HebrewDayInfo } from './hebrewTime'
import { getHebrewDayInfo } from './hebrewTime'
import type { TimelineEnvironment } from './layers'
import {
  SCALE_DAY,
  SCALE_DECADE,
  SCALE_HOUR,
  SCALE_MINUTE,
  SCALE_MONTH,
  SCALE_QUARTER,
  SCALE_WEEK,
  SCALE_YEAR,
} from './scales'
import type { HebrewStructuralLabelStrategy } from './structuralExpressionPolicy'
import type { HebrewIntradayPointData } from './hebrewIntraday'

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

export const getHebrewQuarterNumber = (month: number) => {
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
  isPrimary = true,
) => {
  const weekdayName = getHebrewWeekdayName(dayInfo)
  const boundaryTime = new Date(boundaryTimeMs)

  if (activeScaleLevel === SCALE_MINUTE) {
    return `${formatCivilTimeWithSeconds(boundaryTime)}, ${weekdayName} ${dayInfo.hebrewDate.day}`
  }

  if (activeScaleLevel === SCALE_HOUR || activeScaleLevel === SCALE_DAY) {
    return `${formatCivilTime(boundaryTime)}, ${weekdayName} ${dayInfo.hebrewDate.day}`
  }

  if (activeScaleLevel === SCALE_WEEK) {
    if (dayInfo.hebrewDate.day === 1) {
      return isPrimary
        ? `${dayInfo.hebrewDate.monthName}, ${weekdayName} 1`
        : `1 ${dayInfo.hebrewDate.monthName}, ${weekdayName}`
    }

    return isPrimary
      ? `${weekdayName} ${dayInfo.hebrewDate.day}`
      : `${dayInfo.hebrewDate.day}, ${weekdayName}`
  }

  if (activeScaleLevel === SCALE_MONTH) {
    if (dayInfo.hebrewDate.day === 1) {
      if (weekdayName === 'Shabbat') {
        return isPrimary
          ? `${dayInfo.hebrewDate.monthName}, Shabbat 1`
          : `1 ${dayInfo.hebrewDate.monthName}, Shabbat`
      }

      return isPrimary
        ? `${dayInfo.hebrewDate.monthName} 1`
        : `1 ${dayInfo.hebrewDate.monthName}`
    }

    if (weekdayName === 'Shabbat') {
      return isPrimary
        ? `Shabbat ${dayInfo.hebrewDate.day}`
        : `${dayInfo.hebrewDate.day}, Shabbat`
    }

    return String(dayInfo.hebrewDate.day)
  }

  if (activeScaleLevel === SCALE_QUARTER) {
    if (dayInfo.hebrewDate.day === 1) {
      const quarterNumber = getHebrewQuarterNumber(dayInfo.hebrewDate.month)
      const quarterStartMonths = new Set([7, 10, 1, 4])

      if (quarterStartMonths.has(dayInfo.hebrewDate.month)) {
        return isPrimary
          ? `Q${quarterNumber}, ${dayInfo.hebrewDate.monthName}`
          : `${dayInfo.hebrewDate.monthName}, Q${quarterNumber}`
      }

      return dayInfo.hebrewDate.monthName
    }

    if (weekdayName === 'Rishon') {
      return 'Rishon'
    }

    return undefined
  }

  if (activeScaleLevel === SCALE_YEAR) {
    if (dayInfo.hebrewDate.day === 1) {
      if (dayInfo.hebrewDate.month === 7) {
        return isPrimary
          ? `${dayInfo.hebrewDate.year}, ${dayInfo.hebrewDate.monthName}`
          : `${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
      }

      return dayInfo.hebrewDate.monthName
    }

    return undefined
  }

  if (activeScaleLevel === SCALE_DECADE) {
    if (dayInfo.hebrewDate.year % 7 === 0) {
      return isPrimary
        ? `Shmita ${dayInfo.hebrewDate.year}`
        : `${dayInfo.hebrewDate.year}, Shmita`
    }

    return String(dayInfo.hebrewDate.year)
  }

  return dayInfo.hebrewDate.label
}

export const renderHebrewStructuralLabelStrategy = (
  labelStrategy: HebrewStructuralLabelStrategy,
  dayInfo: HebrewDayInfo,
  boundaryTimeMs: number,
  isPrimary: boolean,
  intradayPoint?: HebrewIntradayPointData,
  intradayLabel?: string,
) => {
  switch (labelStrategy) {
    case 'hebrew-minute-view-zman':
    case 'hebrew-minute-view-day-boundary':
    case 'hebrew-minute-view-week-boundary':
    case 'hebrew-hour-view-zman':
    case 'hebrew-hour-view-day-boundary':
    case 'hebrew-hour-view-week-boundary':
    case 'hebrew-day-view-zman':
    case 'hebrew-day-view-day-boundary':
    case 'hebrew-day-view-week-boundary':
      return intradayLabel ?? intradayPoint?.label ?? ''
    case 'hebrew-week-view-boundary':
      return getHebrewTickLabel(SCALE_WEEK, dayInfo, boundaryTimeMs, isPrimary) ?? ''
    case 'hebrew-month-view-boundary':
      return getHebrewTickLabel(SCALE_MONTH, dayInfo, boundaryTimeMs, isPrimary) ?? ''
    case 'hebrew-quarter-view-boundary-leading':
      return getHebrewTickLabel(SCALE_QUARTER, dayInfo, boundaryTimeMs, true) ?? ''
    case 'hebrew-quarter-view-boundary-supporting':
      return getHebrewTickLabel(SCALE_QUARTER, dayInfo, boundaryTimeMs, false) ?? ''
    case 'hebrew-year-view-quarter-boundary-leading':
      return getHebrewTickLabel(SCALE_QUARTER, dayInfo, boundaryTimeMs, true) ?? ''
    case 'hebrew-year-view-quarter-boundary-supporting':
      return getHebrewTickLabel(SCALE_QUARTER, dayInfo, boundaryTimeMs, false) ?? ''
    case 'hebrew-year-view-boundary':
      return getHebrewTickLabel(SCALE_YEAR, dayInfo, boundaryTimeMs, isPrimary) ?? ''
    case 'hebrew-decade-view-boundary':
      return getHebrewTickLabel(SCALE_DECADE, dayInfo, boundaryTimeMs, isPrimary) ?? ''
    default:
      return ''
  }
}

export const getHebrewContextLabel = (
  activeScaleLevel: number,
  timeMs: number,
  environment: TimelineEnvironment,
) => {
  const time = new Date(timeMs)
  const dayInfo = getHebrewDayInfo(time, environment)
  const weekdayName = getHebrewWeekdayName(dayInfo)

  if (activeScaleLevel === SCALE_MINUTE) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilTime(time)}`
  }

  if (activeScaleLevel === SCALE_HOUR) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName}, ${formatCivilHour(time)}`
  }

  if (activeScaleLevel === SCALE_DAY) {
    return `${weekdayName}, ${dayInfo.hebrewDate.day} ${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
  }

  if (activeScaleLevel === SCALE_WEEK || activeScaleLevel === SCALE_MONTH) {
    return `${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
  }

  if (activeScaleLevel === SCALE_QUARTER || activeScaleLevel === SCALE_YEAR) {
    if (activeScaleLevel === SCALE_QUARTER) {
      return `Q${getHebrewQuarterNumber(dayInfo.hebrewDate.month)}, ${dayInfo.hebrewDate.year}`
    }

    return String(dayInfo.hebrewDate.year)
  }

  return undefined
}
