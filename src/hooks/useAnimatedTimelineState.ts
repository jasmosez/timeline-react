import { useEffect, useState } from 'react'

import type { ZoomLevel } from '../timeline/scales'

type AnimatedTimelineState = {
  timelineZoom: ZoomLevel
  timelineFocusTimeMs: number
  prevZoom?: ZoomLevel
  prevFocusTimeMs?: number
  isZoomTransitioning: boolean
}

export function useAnimatedTimelineState(zoom: ZoomLevel, focusTimeMs: number): AnimatedTimelineState {
  const [timelineZoom, setTimelineZoom] = useState<ZoomLevel>(zoom)
  const [timelineFocusTimeMs, setTimelineFocusTimeMs] = useState<number>(focusTimeMs)
  const [prevZoom, setPrevZoom] = useState<ZoomLevel>()
  const [prevFocusTimeMs, setPrevFocusTimeMs] = useState<number>()

  useEffect(() => {
    if (zoom === timelineZoom && focusTimeMs === timelineFocusTimeMs) {
      if (prevZoom !== undefined || prevFocusTimeMs !== undefined) {
        setPrevZoom(undefined)
        setPrevFocusTimeMs(undefined)
      }
      return
    }

    if (zoom === timelineZoom) {
      setPrevZoom(undefined)
      setPrevFocusTimeMs(undefined)
      setTimelineFocusTimeMs(focusTimeMs)
      return
    }

    setPrevZoom(timelineZoom)
    setPrevFocusTimeMs(timelineFocusTimeMs)

    const frameId = requestAnimationFrame(() => {
      const secondFrameId = requestAnimationFrame(() => {
        setTimelineZoom(zoom)
        setTimelineFocusTimeMs(focusTimeMs)
      })

      return () => cancelAnimationFrame(secondFrameId)
    })

    return () => cancelAnimationFrame(frameId)
  }, [zoom, focusTimeMs, timelineZoom, timelineFocusTimeMs, prevZoom, prevFocusTimeMs])

  return {
    timelineZoom,
    timelineFocusTimeMs,
    prevZoom,
    prevFocusTimeMs,
    isZoomTransitioning: prevZoom !== undefined && prevFocusTimeMs !== undefined,
  }
}
