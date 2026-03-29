import type { ScaleLevel } from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan } from './types'

export type TimelineEnvironment = {
  now: Date
  birthDate: Date
}

export type LayerRenderContext = {
  environment: TimelineEnvironment
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  startTickDate: Date
  timelineActiveScaleLevel: ScaleLevel
  timelineFocusTimeMs: number
  timelineVisibleDurationMs: number
  prevActiveScaleLevel?: ScaleLevel
  prevFocusTimeMs?: number
  prevVisibleDurationMs?: number
}

export interface TimelineLayer {
  id: string
  label: string
  getPoints: (context: LayerRenderContext) => PositionedTimelinePoint[]
  getSpans: (context: LayerRenderContext) => PositionedTimelineSpan[]
}

export type TimelineLayerId = TimelineLayer['id']

export const combineLayerPoints = (
  layers: TimelineLayer[],
  context: LayerRenderContext,
): PositionedTimelinePoint[] =>
  layers.flatMap((layer) => layer.getPoints(context))

export const combineLayerSpans = (
  layers: TimelineLayer[],
  context: LayerRenderContext,
): PositionedTimelineSpan[] =>
  layers.flatMap((layer) => layer.getSpans(context))
