import type { LeadingCalendarSystemId, TimelineEnvironment } from './layers'
import { SCALE_LEVEL_CONFIG, type ScaleLevel } from './scales'
import {
  getHebrewContainingPeriodEndTimeMs,
  getHebrewContainingPeriodStartTimeMs,
} from './hebrewTime'

const getGregorianContainingPeriodEndTimeMs = (scaleLevel: ScaleLevel, startTimeMs: number) => {
  const startDate = new Date(startTimeMs)

  switch (scaleLevel) {
    case -1:
      return startTimeMs + 60 * 1000
    case 0:
      return startTimeMs + 60 * 60 * 1000
    case 1:
      return startTimeMs + 24 * 60 * 60 * 1000
    case 2:
      return startTimeMs + 7 * 24 * 60 * 60 * 1000
    case 3: {
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      return endDate.getTime()
    }
    case 4: {
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)
      return endDate.getTime()
    }
    case 5: {
      const endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 1)
      return endDate.getTime()
    }
    case 6: {
      const endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 10)
      return endDate.getTime()
    }
    default:
      return SCALE_LEVEL_CONFIG[scaleLevel].calculateTickTimeFunc(startDate, 1)
  }
}

export const getContainingPeriodStartTimeMs = (
  leadingCalendarSystemId: LeadingCalendarSystemId,
  scaleLevel: ScaleLevel,
  referenceTime: Date,
  environment: TimelineEnvironment,
) => {
  if (leadingCalendarSystemId === 'hebrew') {
    return getHebrewContainingPeriodStartTimeMs(scaleLevel, referenceTime, environment)
  }

  return SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(referenceTime).getTime()
}

export const getContainingPeriodFocusTimeMs = (
  leadingCalendarSystemId: LeadingCalendarSystemId,
  scaleLevel: ScaleLevel,
  referenceTime: Date,
  environment: TimelineEnvironment,
) => {
  const startTimeMs = getContainingPeriodStartTimeMs(
    leadingCalendarSystemId,
    scaleLevel,
    referenceTime,
    environment,
  )

  const endTimeMs = leadingCalendarSystemId === 'hebrew'
    ? getHebrewContainingPeriodEndTimeMs(scaleLevel, referenceTime, environment)
    : getGregorianContainingPeriodEndTimeMs(scaleLevel, startTimeMs)

  return startTimeMs + (endTimeMs - startTimeMs) / 2
}
