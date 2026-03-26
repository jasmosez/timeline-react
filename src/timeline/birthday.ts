import { SCALE_CONFIG, type ZoomLevel } from './scales'
import { positionTimelinePoint } from './layout'
import type { TimelineLayer } from './layers'
import type { PositionedTimelinePoint, TimelinePoint } from './types'

type BirthdayMarkerParams = {
  zoom: ZoomLevel
  firstTickDate: Date
  timelineZoom: ZoomLevel
  timelineFirstTickDate: Date
  birthDate: Date
}

const getVisibleRangeEnd = (zoom: ZoomLevel, firstTickDate: Date) => {
  const { calculateTickTimeFunc, visibleTicks } = SCALE_CONFIG[zoom]
  return calculateTickTimeFunc(firstTickDate, visibleTicks)
}

const createBirthdayAnniversary = (birthDate: Date, age: number) =>
  new Date(
    birthDate.getFullYear() + age,
    birthDate.getMonth(),
    birthDate.getDate(),
    birthDate.getHours(),
    birthDate.getMinutes(),
    birthDate.getSeconds(),
    birthDate.getMilliseconds(),
  )

export const createBirthdayLayerPoints = ({
  zoom,
  firstTickDate,
  timelineZoom,
  timelineFirstTickDate,
  birthDate,
}: BirthdayMarkerParams): PositionedTimelinePoint[] => {
  const rangeStartMs = firstTickDate.getTime()
  const rangeEndMs = getVisibleRangeEnd(zoom, firstTickDate)
  const startingAge = Math.max(firstTickDate.getFullYear() - birthDate.getFullYear() - 1, 0)
  const endingAge = Math.max(new Date(rangeEndMs).getFullYear() - birthDate.getFullYear() + 1, 0)
  const points: PositionedTimelinePoint[] = []

  for (let age = startingAge; age <= endingAge; age++) {
    const anniversary = createBirthdayAnniversary(birthDate, age)
    const anniversaryMs = anniversary.getTime()

    if (anniversaryMs < rangeStartMs || anniversaryMs > rangeEndMs) {
      continue
    }

    const point: TimelinePoint = {
      id: `birthday-${age}-${anniversaryMs}`,
      kind: 'marker',
      timeMs: anniversaryMs,
      label: `Age ${age}`,
    }

    points.push(
      positionTimelinePoint(point, timelineZoom, timelineFirstTickDate, {
        className: 'birthday-marker',
        labelClassName: 'birthday-marker-label',
      }),
    )
  }

  return points
}

export const birthdayLayer: TimelineLayer = {
  id: 'birthday',
  label: 'Birthday',
  getPoints: ({ zoom, firstTickDate, timelineZoom, timelineFirstTickDate, birthDate }) =>
    createBirthdayLayerPoints({
      zoom,
      firstTickDate,
      timelineZoom,
      timelineFirstTickDate,
      birthDate,
    }),
  getSpans: () => [],
}
