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

export const ZOOM: Record<number, ZoomLevelConfig> = GREGORIAN_SCALE_CONFIG

export type ZoomLevel = keyof typeof ZOOM

export const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))
export const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))

export const getTickLabel = (tickTime: number, zoom: ZoomLevel, firstTickDate: Date) => {
  const { renderTickLabel, calculateTickTimeFunc } = ZOOM[zoom]
  return renderTickLabel(tickTime, tickTime === calculateTickTimeFunc(firstTickDate, 0))
}

export const getPointPercent = (pointTime: number, zoom: ZoomLevel, firstTickDate: Date) => {
  const { calculateTickTimeFunc, screenSpan, visibleTicks } = ZOOM[zoom]

  const firstTickOffsetPercentage = (100 / visibleTicks) / 2
  const firstTickOffsetMs = (screenSpan * firstTickOffsetPercentage) / 100
  const screenStartTime = calculateTickTimeFunc(firstTickDate, 0) - firstTickOffsetMs
  const timeSinceStart = pointTime - screenStartTime
  const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100
  return `${percentageOfScreenSpan}%`
}
