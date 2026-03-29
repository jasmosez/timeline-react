import { STARTING_SCALE_LEVEL } from './config'
import {
  SCALE_LEVEL_CONFIG,
  getNearestScaleLevel,
  getScaleLevelVisibleDurationMs,
  getVisibleRangeStartTickDate,
} from './timeline/scales'

export type ViewportRangeStrategy = 'centered' | 'currentContainingPeriod'

export interface Viewport {
  focusTimeMs: number
  visibleDurationMs: number
  rangeStrategy: ViewportRangeStrategy
}

export const createInitialViewport = (now: Date): Viewport => ({
  focusTimeMs: now.getTime(),
  visibleDurationMs: getScaleLevelVisibleDurationMs(STARTING_SCALE_LEVEL),
  rangeStrategy: 'currentContainingPeriod',
})

export const getViewportActiveScaleLevel = (viewport: Viewport) =>
  getNearestScaleLevel(viewport.visibleDurationMs)

export const getViewportStartTickDate = (viewport: Viewport) => {
  const activeScaleLevel = getViewportActiveScaleLevel(viewport)

  if (viewport.rangeStrategy === 'centered') {
    return getVisibleRangeStartTickDate(activeScaleLevel, viewport.focusTimeMs, viewport.visibleDurationMs)
  }

  return SCALE_LEVEL_CONFIG[activeScaleLevel].startTickDateFunc(new Date(viewport.focusTimeMs))
}
