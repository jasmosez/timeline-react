import { useEffect, useState } from 'react'

import type { ScaleLevel } from '../timeline/scales'

type AnimatedTimelineState = {
  timelineActiveScaleLevel: ScaleLevel
  timelineFocusTimeMs: number
  timelineVisibleDurationMs: number
  prevActiveScaleLevel?: ScaleLevel
  prevFocusTimeMs?: number
  prevVisibleDurationMs?: number
  isZoomTransitioning: boolean
}

export function useAnimatedTimelineState(
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
): AnimatedTimelineState {
  const [timelineActiveScaleLevel, setTimelineActiveScaleLevel] = useState<ScaleLevel>(activeScaleLevel)
  const [timelineFocusTimeMs, setTimelineFocusTimeMs] = useState<number>(focusTimeMs)
  const [timelineVisibleDurationMs, setTimelineVisibleDurationMs] = useState<number>(visibleDurationMs)
  const [prevActiveScaleLevel, setPrevActiveScaleLevel] = useState<ScaleLevel>()
  const [prevFocusTimeMs, setPrevFocusTimeMs] = useState<number>()
  const [prevVisibleDurationMs, setPrevVisibleDurationMs] = useState<number>()

  useEffect(() => {
    if (
      activeScaleLevel === timelineActiveScaleLevel &&
      focusTimeMs === timelineFocusTimeMs &&
      visibleDurationMs === timelineVisibleDurationMs
    ) {
      if (
        prevActiveScaleLevel !== undefined ||
        prevFocusTimeMs !== undefined ||
        prevVisibleDurationMs !== undefined
      ) {
        setPrevActiveScaleLevel(undefined)
        setPrevFocusTimeMs(undefined)
        setPrevVisibleDurationMs(undefined)
      }
      return
    }

    if (activeScaleLevel === timelineActiveScaleLevel) {
      setPrevActiveScaleLevel(undefined)
      setPrevFocusTimeMs(undefined)
      setPrevVisibleDurationMs(undefined)
      setTimelineFocusTimeMs(focusTimeMs)
      setTimelineVisibleDurationMs(visibleDurationMs)
      return
    }

    setPrevActiveScaleLevel(timelineActiveScaleLevel)
    setPrevFocusTimeMs(timelineFocusTimeMs)
    setPrevVisibleDurationMs(timelineVisibleDurationMs)

    const frameId = requestAnimationFrame(() => {
      const secondFrameId = requestAnimationFrame(() => {
        setTimelineActiveScaleLevel(activeScaleLevel)
        setTimelineFocusTimeMs(focusTimeMs)
        setTimelineVisibleDurationMs(visibleDurationMs)
      })

      return () => cancelAnimationFrame(secondFrameId)
    })

    return () => cancelAnimationFrame(frameId)
  }, [
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    timelineActiveScaleLevel,
    timelineFocusTimeMs,
    timelineVisibleDurationMs,
    prevActiveScaleLevel,
    prevFocusTimeMs,
    prevVisibleDurationMs,
  ])

  return {
    timelineActiveScaleLevel,
    timelineFocusTimeMs,
    timelineVisibleDurationMs,
    prevActiveScaleLevel,
    prevFocusTimeMs,
    prevVisibleDurationMs,
    isZoomTransitioning: prevActiveScaleLevel !== undefined && prevFocusTimeMs !== undefined,
  }
}
