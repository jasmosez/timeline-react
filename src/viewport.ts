import { STARTING_ZOOM } from './config'
import { SCALE_CONFIG, type ZoomLevel } from './timeline/scales'

export type ViewportRangeStrategy = 'centered' | 'currentContainingPeriod' | 'custom'

export interface Viewport {
  focusTimeMs: number
  zoomLevel: ZoomLevel
  rangeStrategy: ViewportRangeStrategy
  customFirstTickTimeMs?: number
}

export const createInitialViewport = (now: Date): Viewport => ({
  focusTimeMs: now.getTime(),
  zoomLevel: STARTING_ZOOM,
  rangeStrategy: 'currentContainingPeriod',
})

export const getViewportFirstTickDate = (viewport: Viewport) => {
  if (viewport.rangeStrategy === 'custom' && viewport.customFirstTickTimeMs !== undefined) {
    return new Date(viewport.customFirstTickTimeMs)
  }

  // For the current prototype, both centered and currentContainingPeriod views
  // align to the containing period boundary for the active zoom level.
  return SCALE_CONFIG[viewport.zoomLevel].firstTickDateFunc(new Date(viewport.focusTimeMs))
}
