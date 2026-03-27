/**
 * Represents a zoom level configuration.
 *
 * @typedef {Object} ZoomLevelConfig
 * @property {'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade'} key
 * @property {string} label
 * @property {number} visibleTicks
 * @property {'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'} unit
 * @property {number} screenSpan
 * @property {(firstTick: Date, addedUnits: number) => number} calculateTickTimeFunc
 * @property {(date: Date) => Date} firstTickDateFunc
 * @property {(tickTime: number, isFirstTick: boolean) => string | undefined} renderTickLabel
 */
export type ZoomLevelConfig = {
  key: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
  label: string,
  visibleTicks: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'
  screenSpan: number
  calculateTickTimeFunc: (firstTick: Date, addedUnits: number) => number
  firstTickDateFunc: (date: Date) => Date
  renderTickLabel: (tickTime: number, isFirstTick: boolean) => string | undefined
}
import { GREGORIAN_SCALE_CONFIG } from './gregorianScaleConfig'

export const SCALE_CONFIG: Record<number, ZoomLevelConfig> = GREGORIAN_SCALE_CONFIG

export type ZoomLevel = keyof typeof SCALE_CONFIG

export const zoomMax = Math.max(...Object.keys(SCALE_CONFIG).map(Number))
export const zoomMin = Math.min(...Object.keys(SCALE_CONFIG).map(Number))

export const getTickLabel = (tickTime: number, zoom: ZoomLevel, startTickDate: Date) => {
  const { renderTickLabel, calculateTickTimeFunc } = SCALE_CONFIG[zoom]
  return renderTickLabel(tickTime, tickTime === calculateTickTimeFunc(startTickDate, 0))
}

export const getVisibleTimeRange = (zoom: ZoomLevel, focusTimeMs: number) => {
  const { screenSpan } = SCALE_CONFIG[zoom]
  return {
    startTimeMs: focusTimeMs - screenSpan / 2,
    endTimeMs: focusTimeMs + screenSpan / 2,
  }
}

export const getPointPercent = (pointTime: number, zoom: ZoomLevel, focusTimeMs: number) => {
  const { screenSpan } = SCALE_CONFIG[zoom]
  const { startTimeMs } = getVisibleTimeRange(zoom, focusTimeMs)
  const timeSinceStart = pointTime - startTimeMs
  const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100
  return `${percentageOfScreenSpan}%`
}

export const getViewportCenterTimeMs = (zoom: ZoomLevel, startTickDate: Date) => {
  const { calculateTickTimeFunc, screenSpan, visibleTicks } = SCALE_CONFIG[zoom]
  const firstTickOffsetPercentage = (100 / visibleTicks) / 2
  const firstTickOffsetMs = (screenSpan * firstTickOffsetPercentage) / 100
  const screenStartTime = calculateTickTimeFunc(startTickDate, 0) - firstTickOffsetMs
  return screenStartTime + screenSpan / 2
}

export const getCenteredFirstTickDate = (zoom: ZoomLevel, centerTimeMs: number) => {
  const { firstTickDateFunc, calculateTickTimeFunc, visibleTicks } = SCALE_CONFIG[zoom]
  const centeredDate = firstTickDateFunc(new Date(centerTimeMs))
  const ticksToShift = Math.floor(visibleTicks / 2)
  return new Date(calculateTickTimeFunc(centeredDate, -ticksToShift))
}
