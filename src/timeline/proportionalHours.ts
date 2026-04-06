import type { TimelineLayer } from './layers'
import { positionTimelinePoint } from './layout'
import { getHebrewIntradayDayPoints, isProportionalHourMarkerPoint } from './hebrewIntraday'

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

    return getHebrewIntradayDayPoints(focusTimeMs, visibleDurationMs, environment)
      .filter(isProportionalHourMarkerPoint)
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
