import type { ZoomLevel } from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan } from './types'

export type LayerRenderContext = {
  zoom: ZoomLevel
  firstTickDate: Date
  timelineZoom: ZoomLevel
  timelineFirstTickDate: Date
  prevZoom?: ZoomLevel
  prevFirstTickDate?: Date
}

export interface TimelineLayer {
  id: string
  label: string
  getPoints: (context: LayerRenderContext) => PositionedTimelinePoint[]
  getSpans: (context: LayerRenderContext) => PositionedTimelineSpan[]
}

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
