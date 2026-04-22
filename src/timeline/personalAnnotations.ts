import { positionTimelineSpan } from './layout'
import { getVisibleTimeRange, type ScaleLevel } from './scales'
import type { TimelineEnvironment } from './layers'
import {
  getCivilDateOrdinal,
  getDateForCivilDayOrdinalStart,
  getPersonalDayOfLife,
} from './personalTime'

export type DayAnnotation = {
  dayOfLife: number
  plans: string
  journal: string
  journaledOnDay: boolean
}

export type DayAnnotationMap = Record<string, DayAnnotation>

export type PositionedDayAnnotation = {
  dayOfLife: number
  top: string
  height: string
}

const VISIBLE_ANNOTATION_SCALES: ScaleLevel[] = [2, 3]

export const DAY_ANNOTATIONS_STORAGE_KEY = 'timeline-react.day-annotations'

export const loadDayAnnotations = (): DayAnnotationMap => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(DAY_ANNOTATIONS_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as DayAnnotationMap
    return parsed ?? {}
  } catch {
    return {}
  }
}

export const saveDayAnnotations = (annotations: DayAnnotationMap) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DAY_ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations))
}

export const getPositionedDayAnnotations = (
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: TimelineEnvironment,
): PositionedDayAnnotation[] => {
  if (!VISIBLE_ANNOTATION_SCALES.includes(activeScaleLevel)) {
    return []
  }

  const visibleRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const startOrdinal = getCivilDateOrdinal(new Date(visibleRange.startTimeMs), environment.timezone)
  const endOrdinal = getCivilDateOrdinal(new Date(visibleRange.endTimeMs - 1), environment.timezone)
  const positioned: PositionedDayAnnotation[] = []

  for (let ordinal = startOrdinal; ordinal <= endOrdinal; ordinal += 1) {
    const dayStart = getDateForCivilDayOrdinalStart(ordinal, environment.timezone)
    const dayEnd = getDateForCivilDayOrdinalStart(ordinal + 1, environment.timezone)
    const dayOfLife = getPersonalDayOfLife(dayStart, environment)

    if (dayOfLife === undefined) {
      continue
    }

    const span = positionTimelineSpan(
      {
        id: `annotation-day-${dayOfLife}`,
        kind: 'note-range',
        startTimeMs: dayStart.getTime(),
        endTimeMs: dayEnd.getTime(),
      },
      focusTimeMs,
      visibleDurationMs,
    )

    positioned.push({
      dayOfLife,
      top: span.top,
      height: span.height,
    })
  }

  return positioned
}

export const updateDayAnnotation = (
  annotations: DayAnnotationMap,
  dayOfLife: number,
  field: 'plans' | 'journal' | 'journaledOnDay',
  value: string | boolean,
): DayAnnotationMap => {
  const key = String(dayOfLife)
  const current = annotations[key] ?? {
    dayOfLife,
    plans: '',
    journal: '',
    journaledOnDay: false,
  }

  const next = {
    ...current,
    [field]: value,
  } as DayAnnotation

  const shouldDelete = next.plans.trim() === '' && next.journal.trim() === '' && !next.journaledOnDay
  if (shouldDelete) {
    const { [key]: _removed, ...rest } = annotations
    return rest
  }

  return {
    ...annotations,
    [key]: next,
  }
}
