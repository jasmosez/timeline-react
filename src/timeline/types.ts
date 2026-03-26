import type { ZoomLevel } from './scales'

export interface TimelinePoint {
  id: string
  kind: 'tick' | 'marker'
  timeMs: number
  zoom: ZoomLevel
  firstTickDate: Date
  fadeOut?: boolean
  className?: string
  labelClassName?: string
  label?: string
}
