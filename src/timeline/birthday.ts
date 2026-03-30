import { getVisibleTimeRange, type ScaleLevel } from './scales'
import { positionTimelinePoint } from './layout'
import type { TimelineLayer } from './layers'
import type { PositionedTimelinePoint, TimelinePoint } from './types'

type BirthdayMarkerParams = {
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  startTickDate: Date
  birthDate: Date
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
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  startTickDate,
  birthDate,
}: BirthdayMarkerParams): PositionedTimelinePoint[] => {
  const { startTimeMs: rangeStartMs, endTimeMs: rangeEndMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const startingAge = Math.max(new Date(rangeStartMs).getFullYear() - birthDate.getFullYear() - 1, 0)
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
      positionTimelinePoint(
        point,
        activeScaleLevel,
        focusTimeMs,
        visibleDurationMs,
        startTickDate,
        {
          className: 'birthday-marker',
          labelClassName: 'birthday-marker-label',
        },
      ),
    )
  }

  return points
}

export const birthdayLayer: TimelineLayer = {
  id: 'birthday',
  label: 'Birthday',
  getPoints: ({
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    startTickDate,
    environment,
  }) =>
    createBirthdayLayerPoints({
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      startTickDate,
      birthDate: environment.birthDate,
    }),
  getSpans: () => [],
}
