import { STARTING_SCALE_LEVEL } from './config'
import type { TimelineEnvironment } from './timeline/layers'
import { getContainingPeriodFocusTimeMs } from './timeline/periodAnchoring'
import {
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

export const createInitialViewport = (
  now: Date,
  environment: Pick<TimelineEnvironment, 'birthDate' | 'timezone' | 'location'>,
): Viewport => ({
  focusTimeMs: getContainingPeriodFocusTimeMs(
    'gregorian',
    STARTING_SCALE_LEVEL,
    now,
    {
      now,
      ...environment,
    },
  ),
  visibleDurationMs: getScaleLevelVisibleDurationMs(STARTING_SCALE_LEVEL),
  rangeStrategy: 'currentContainingPeriod',
})

export const getViewportActiveScaleLevel = (viewport: Viewport) =>
  getNearestScaleLevel(viewport.visibleDurationMs)

export const getViewportStartTickDate = (viewport: Viewport) =>
  getVisibleRangeStartTickDate(
    getViewportActiveScaleLevel(viewport),
    viewport.focusTimeMs,
    viewport.visibleDurationMs,
  )
