import { STARTING_ZOOM } from './config'
import { SCALE_CONFIG, getCenteredFirstTickDate, type ZoomLevel } from './timeline/scales'

export type ViewportRangeStrategy = 'centered' | 'currentContainingPeriod'

export interface Viewport {
  focusTimeMs: number
  zoomLevel: ZoomLevel
  rangeStrategy: ViewportRangeStrategy
}

export const createInitialViewport = (now: Date): Viewport => ({
  focusTimeMs: now.getTime(),
  zoomLevel: STARTING_ZOOM,
  rangeStrategy: 'currentContainingPeriod',
})

export const getViewportStartTickDate = (viewport: Viewport) => {
  if (viewport.rangeStrategy === 'centered') {
    return getCenteredFirstTickDate(viewport.zoomLevel, viewport.focusTimeMs)
  }

  return SCALE_CONFIG[viewport.zoomLevel].firstTickDateFunc(new Date(viewport.focusTimeMs))
}
