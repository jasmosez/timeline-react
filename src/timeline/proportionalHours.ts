import type { TimelineLayer } from './layers'
import { positionTimelinePoint } from './layout'
import { getHebrewProportionalHourDayPoints } from './hebrew'

export const proportionalHoursLayer: TimelineLayer = {
  id: 'proportional-hours',
  label: 'Proportional Hours',
  role: 'marker',
  getPoints: ({
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    environment,
  }) => {
    if (activeScaleLevel !== 1) {
      return []
    }

    return getHebrewProportionalHourDayPoints(focusTimeMs, visibleDurationMs, environment)
      .filter((point) => point.rankClass === 'tick-rank-ordinary' && point.label === '')
      .map((point) =>
        positionTimelinePoint(
          {
            id: point.id,
            kind: 'marker',
            timeMs: point.timeMs,
            label: point.label,
          },
          activeScaleLevel,
          focusTimeMs,
          visibleDurationMs,
          new Date(point.timeMs),
          {
            className: 'proportional-hours-marker',
            labelClassName: 'proportional-hours-marker-label',
          },
        ),
      )
  },
  getSpans: () => [],
}
