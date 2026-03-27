/**
 * Represents a scale level configuration.
 *
 * @typedef {Object} ScaleLevelConfig
 * @property {'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade'} key
 * @property {string} label
 * @property {number} visibleTicks
 * @property {'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'} unit
 * @property {number} screenSpan
 * @property {(firstTick: Date, addedUnits: number) => number} calculateTickTimeFunc
 * @property {(date: Date) => Date} startTickDateFunc
 * @property {(tickTime: number, isFirstTick: boolean) => string | undefined} renderTickLabel
 */
export type ScaleLevelConfig = {
  key: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
  label: string,
  visibleTicks: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'
  screenSpan: number
  calculateTickTimeFunc: (firstTick: Date, addedUnits: number) => number
  startTickDateFunc: (date: Date) => Date
  renderTickLabel: (tickTime: number, isFirstTick: boolean) => string | undefined
}
import { GREGORIAN_SCALE_LEVEL_CONFIG } from './gregorianScaleConfig'

export const SCALE_LEVEL_CONFIG: Record<number, ScaleLevelConfig> = GREGORIAN_SCALE_LEVEL_CONFIG

export type ScaleLevel = keyof typeof SCALE_LEVEL_CONFIG

export const scaleLevelMax = Math.max(...Object.keys(SCALE_LEVEL_CONFIG).map(Number))
export const scaleLevelMin = Math.min(...Object.keys(SCALE_LEVEL_CONFIG).map(Number))

export const getTickLabel = (tickTime: number, scaleLevel: ScaleLevel, startTickDate: Date) => {
  const { renderTickLabel, calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  return renderTickLabel(tickTime, tickTime === calculateTickTimeFunc(startTickDate, 0))
}

export const getVisibleTimeRange = (scaleLevel: ScaleLevel, focusTimeMs: number) => {
  const { screenSpan } = SCALE_LEVEL_CONFIG[scaleLevel]
  return {
    startTimeMs: focusTimeMs - screenSpan / 2,
    endTimeMs: focusTimeMs + screenSpan / 2,
  }
}

export const getPointPercent = (pointTime: number, scaleLevel: ScaleLevel, focusTimeMs: number) => {
  const { screenSpan } = SCALE_LEVEL_CONFIG[scaleLevel]
  const { startTimeMs } = getVisibleTimeRange(scaleLevel, focusTimeMs)
  const timeSinceStart = pointTime - startTimeMs
  const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100
  return `${percentageOfScreenSpan}%`
}

export const getViewportCenterTimeMs = (scaleLevel: ScaleLevel, startTickDate: Date) => {
  const { calculateTickTimeFunc, screenSpan, visibleTicks } = SCALE_LEVEL_CONFIG[scaleLevel]
  const firstTickOffsetPercentage = (100 / visibleTicks) / 2
  const firstTickOffsetMs = (screenSpan * firstTickOffsetPercentage) / 100
  const screenStartTime = calculateTickTimeFunc(startTickDate, 0) - firstTickOffsetMs
  return screenStartTime + screenSpan / 2
}

export const getCenteredStartTickDate = (scaleLevel: ScaleLevel, centerTimeMs: number) => {
  const { startTickDateFunc, calculateTickTimeFunc, visibleTicks } = SCALE_LEVEL_CONFIG[scaleLevel]
  const centeredDate = startTickDateFunc(new Date(centerTimeMs))
  const ticksToShift = Math.floor(visibleTicks / 2)
  return new Date(calculateTickTimeFunc(centeredDate, -ticksToShift))
}
