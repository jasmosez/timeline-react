import { useEffect, useState } from 'react'

import type { ZoomLevel } from '../timeline/scales'

type AnimatedTimelineState = {
  timelineZoom: ZoomLevel
  timelineFirstTickDate: Date
  prevZoom?: ZoomLevel
  prevFirstTickDate?: Date
}

export function useAnimatedTimelineState(zoom: ZoomLevel, firstTickDate: Date): AnimatedTimelineState {
  const [timelineZoom, setTimelineZoom] = useState<ZoomLevel>(zoom)
  const [timelineFirstTickDate, setTimelineFirstTickDate] = useState<Date>(firstTickDate)
  const [prevZoom, setPrevZoom] = useState<ZoomLevel>()
  const [prevFirstTickDate, setPrevFirstTickDate] = useState<Date>()

  useEffect(() => {
    if (zoom === timelineZoom && firstTickDate === timelineFirstTickDate) {
      return
    }

    setPrevZoom(timelineZoom)
    setPrevFirstTickDate(timelineFirstTickDate)

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimelineZoom(zoom)
        setTimelineFirstTickDate(firstTickDate)
      })
    })

    return () => cancelAnimationFrame(frameId)
  }, [zoom, firstTickDate, timelineZoom, timelineFirstTickDate])

  return {
    timelineZoom,
    timelineFirstTickDate,
    prevZoom,
    prevFirstTickDate,
  }
}
