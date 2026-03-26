export interface TimelinePoint {
  id: string
  kind: 'tick' | 'marker'
  timeMs: number
  label?: string
  priority?: number
}

export interface PositionedTimelinePoint extends TimelinePoint {
  top: string
  opacity?: number
  className?: string
  labelClassName?: string
}

export interface TimelineSpan {
  id: string
  kind: 'structural-period' | 'event' | 'note-range'
  startTimeMs: number
  endTimeMs: number
  label?: string
  priority?: number
}

export interface PositionedTimelineSpan extends TimelineSpan {
  top: string
  height: string
  opacity?: number
  className?: string
}
