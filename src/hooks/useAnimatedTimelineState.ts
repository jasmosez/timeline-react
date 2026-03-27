import { useEffect, useState } from 'react'

import type { ScaleLevel } from '../timeline/scales'

type AnimatedTimelineState = {
  timelineScaleLevel: ScaleLevel
  timelineFocusTimeMs: number
  prevScaleLevel?: ScaleLevel
  prevFocusTimeMs?: number
  isZoomTransitioning: boolean
}

export function useAnimatedTimelineState(scaleLevel: ScaleLevel, focusTimeMs: number): AnimatedTimelineState {
  const [timelineScaleLevel, setTimelineScaleLevel] = useState<ScaleLevel>(scaleLevel)
  const [timelineFocusTimeMs, setTimelineFocusTimeMs] = useState<number>(focusTimeMs)
  const [prevScaleLevel, setPrevScaleLevel] = useState<ScaleLevel>()
  const [prevFocusTimeMs, setPrevFocusTimeMs] = useState<number>()

  useEffect(() => {
    if (scaleLevel === timelineScaleLevel && focusTimeMs === timelineFocusTimeMs) {
      if (prevScaleLevel !== undefined || prevFocusTimeMs !== undefined) {
        setPrevScaleLevel(undefined)
        setPrevFocusTimeMs(undefined)
      }
      return
    }

    if (scaleLevel === timelineScaleLevel) {
      setPrevScaleLevel(undefined)
      setPrevFocusTimeMs(undefined)
      setTimelineFocusTimeMs(focusTimeMs)
      return
    }

    setPrevScaleLevel(timelineScaleLevel)
    setPrevFocusTimeMs(timelineFocusTimeMs)

    const frameId = requestAnimationFrame(() => {
      const secondFrameId = requestAnimationFrame(() => {
        setTimelineScaleLevel(scaleLevel)
        setTimelineFocusTimeMs(focusTimeMs)
      })

      return () => cancelAnimationFrame(secondFrameId)
    })

    return () => cancelAnimationFrame(frameId)
  }, [scaleLevel, focusTimeMs, timelineScaleLevel, timelineFocusTimeMs, prevScaleLevel, prevFocusTimeMs])

  return {
    timelineScaleLevel,
    timelineFocusTimeMs,
    prevScaleLevel,
    prevFocusTimeMs,
    isZoomTransitioning: prevScaleLevel !== undefined && prevFocusTimeMs !== undefined,
  }
}
