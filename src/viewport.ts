import { STARTING_SCALE_LEVEL } from './config'
import { SCALE_LEVEL_CONFIG, getCenteredStartTickDate, type ScaleLevel } from './timeline/scales'

export type ViewportRangeStrategy = 'centered' | 'currentContainingPeriod'

export interface Viewport {
  focusTimeMs: number
  scaleLevel: ScaleLevel
  rangeStrategy: ViewportRangeStrategy
}

export const createInitialViewport = (now: Date): Viewport => ({
  focusTimeMs: now.getTime(),
  scaleLevel: STARTING_SCALE_LEVEL,
  rangeStrategy: 'currentContainingPeriod',
})

export const getViewportStartTickDate = (viewport: Viewport) => {
  if (viewport.rangeStrategy === 'centered') {
    return getCenteredStartTickDate(viewport.scaleLevel, viewport.focusTimeMs)
  }

  return SCALE_LEVEL_CONFIG[viewport.scaleLevel].startTickDateFunc(new Date(viewport.focusTimeMs))
}
