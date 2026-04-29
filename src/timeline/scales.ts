/**
 * Represents a scale level configuration.
 *
 * @typedef {Object} ScaleLevelConfig
 * @property {'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade'} key
 * @property {string} label
 * @property {number} visibleTicks
 * @property {'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'} unit
 * @property {number} screenSpan
 * @property {(firstTick: Date, addedUnits: number) => number} calculateTickTimeFunc
 * @property {(date: Date) => Date} startTickDateFunc
 * @property {(tickTime: number, isFirstTick: boolean) => string | undefined} getTickLabel
 */
export type ScaleLevelConfig = {
  key: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
  label: string,
  visibleTicks: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  screenSpan: number
  calculateTickTimeFunc: (firstTick: Date, addedUnits: number) => number
  startTickDateFunc: (date: Date) => Date
  getTickLabel: (tickTime: number, isFirstTick: boolean) => string | undefined
}
import { GREGORIAN_SCALE_LEVEL_CONFIG } from './gregorianScaleConfig'

export const DEFAULT_SCALE_LEVEL_CONFIG: Record<number, ScaleLevelConfig> = GREGORIAN_SCALE_LEVEL_CONFIG
export const SCALE_LEVEL_CONFIG = DEFAULT_SCALE_LEVEL_CONFIG

export type ScaleLevel = keyof typeof SCALE_LEVEL_CONFIG

export const SCALE_MINUTE = -1 as ScaleLevel
export const SCALE_HOUR = 0 as ScaleLevel
export const SCALE_DAY = 1 as ScaleLevel
export const SCALE_WEEK = 2 as ScaleLevel
export const SCALE_MONTH = 3 as ScaleLevel
export const SCALE_QUARTER = 4 as ScaleLevel
export const SCALE_YEAR = 5 as ScaleLevel
export const SCALE_DECADE = 6 as ScaleLevel

export const scaleLevelMax = Math.max(...Object.keys(SCALE_LEVEL_CONFIG).map(Number))
export const scaleLevelMin = Math.min(...Object.keys(SCALE_LEVEL_CONFIG).map(Number))
const SCALE_LEVEL_ORDER = Object.keys(SCALE_LEVEL_CONFIG)
  .map(Number)
  .sort((a, b) => a - b) as ScaleLevel[]

export const getScaleLevelOrder = () => SCALE_LEVEL_ORDER

export const getScaleLevelVisibleDurationMs = (scaleLevel: ScaleLevel) =>
  SCALE_LEVEL_CONFIG[scaleLevel].screenSpan

export const getScaleDurationBounds = () => ({
  minVisibleDurationMs: Math.min(...SCALE_LEVEL_ORDER.map(getScaleLevelVisibleDurationMs)),
  maxVisibleDurationMs: Math.max(...SCALE_LEVEL_ORDER.map(getScaleLevelVisibleDurationMs)),
})

export const getNearestScaleLevel = (visibleDurationMs: number): ScaleLevel => {
  let nearestScaleLevel = SCALE_LEVEL_ORDER[0]
  let nearestDelta = Math.abs(Math.log(visibleDurationMs) - Math.log(getScaleLevelVisibleDurationMs(nearestScaleLevel)))

  for (const scaleLevel of SCALE_LEVEL_ORDER.slice(1)) {
    const delta = Math.abs(Math.log(visibleDurationMs) - Math.log(getScaleLevelVisibleDurationMs(scaleLevel)))

    if (delta < nearestDelta) {
      nearestScaleLevel = scaleLevel
      nearestDelta = delta
    }
  }

  return nearestScaleLevel
}

export const getTickLabel = (tickTime: number, scaleLevel: ScaleLevel, startTickDate: Date) => {
  const { getTickLabel, calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  return getTickLabel(tickTime, tickTime === calculateTickTimeFunc(startTickDate, 0))
}

export const getVisibleTimeRange = (focusTimeMs: number, visibleDurationMs: number) => {
  return {
    startTimeMs: focusTimeMs - visibleDurationMs / 2,
    endTimeMs: focusTimeMs + visibleDurationMs / 2,
  }
}

export const getPointPercent = (pointTime: number, focusTimeMs: number, visibleDurationMs: number) => {
  const { startTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const timeSinceStart = pointTime - startTimeMs
  const percentageOfScreenSpan = (timeSinceStart / visibleDurationMs) * 100
  return `${percentageOfScreenSpan}%`
}

export const getCenteredStartTickDate = (scaleLevel: ScaleLevel, centerTimeMs: number) => {
  const { startTickDateFunc, calculateTickTimeFunc, visibleTicks } = SCALE_LEVEL_CONFIG[scaleLevel]
  const centeredDate = startTickDateFunc(new Date(centerTimeMs))
  const ticksToShift = Math.floor(visibleTicks / 2)
  return new Date(calculateTickTimeFunc(centeredDate, -ticksToShift))
}

export const getVisibleRangeStartTickDate = (
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { startTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  return SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(new Date(startTimeMs))
}

export const getFirstVisibleTickDate = (
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { startTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  let tickDate = getVisibleRangeStartTickDate(scaleLevel, focusTimeMs, visibleDurationMs)

  while (tickDate.getTime() < startTimeMs) {
    tickDate = new Date(calculateTickTimeFunc(tickDate, 1))
  }

  return tickDate
}
