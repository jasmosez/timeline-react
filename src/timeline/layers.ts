import type { ScaleLevel } from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan } from './types'

export type TimelineEnvironment = {
  now: Date
  birthDate: Date
  timezone: string
  location: {
    city: string
    region: string
    postalCode: string
    latitude: number
    longitude: number
  }
}

export type LayerRenderContext = {
  environment: TimelineEnvironment
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  startTickDate: Date
}

export interface TimelineLayer {
  id: string
  label: string
  role: 'structural' | 'marker'
  getPoints: (context: LayerRenderContext) => PositionedTimelinePoint[]
  getSpans: (context: LayerRenderContext) => PositionedTimelineSpan[]
}

export type TimelineLayerId = TimelineLayer['id']
export type StructuralLayerId = TimelineLayerId
export type PrimaryCalendarSystemId = StructuralLayerId

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
