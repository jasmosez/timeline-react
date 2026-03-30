import { useEffect, useState } from 'react'
// import { HDate, HebrewCalendar } from '@hebcal/core'

import './App.css'
import { getNow } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'
import { PAN_AMOUNT, DEFAULT_BIRTH_DATE } from './config'
import { birthdayLayer } from './timeline/birthday'
import { gregorianLayer } from './timeline/gregorian'
import type { TimelineEnvironment, TimelineLayerId } from './timeline/layers'
import { createInitialViewport, getViewportStartTickDate, type Viewport } from './viewport'
import {
  SCALE_LEVEL_CONFIG,
  getVisibleTimeRange,
  getFirstVisibleTickDate,
  getNearestScaleLevel,
  getScaleDurationBounds,
  getScaleLevelOrder,
  getScaleLevelVisibleDurationMs,
} from './timeline/scales'

const AVAILABLE_TIMELINE_LAYERS = [gregorianLayer, birthdayLayer]
const LOCK_NOW_DEFAULT_PERCENT = 0.5

function App() {
  const [now, setNow] = useState(getNow)
  const [viewport, setViewport] = useState<Viewport>(() => createInitialViewport(now))
  const [birthDate] = useState(DEFAULT_BIRTH_DATE)
  const [activeLayerIds, setActiveLayerIds] = useState<TimelineLayerId[]>(['gregorian'])
  const [lockNow, setLockNow] = useState(false)
  const [lockNowAnchorPercent, setLockNowAnchorPercent] = useState<number | null>(null)

  const activeScaleLevel = getNearestScaleLevel(viewport.visibleDurationMs)
  const startTickDate = getViewportStartTickDate(viewport)
  const firstVisibleTickDate = getFirstVisibleTickDate(
    activeScaleLevel,
    viewport.focusTimeMs,
    viewport.visibleDurationMs,
  )
  const activeLayers = AVAILABLE_TIMELINE_LAYERS.filter((layer) => activeLayerIds.includes(layer.id))
  const timelineEnvironment: TimelineEnvironment = {
    now,
    birthDate,
  }
  const scaleLevelOrder = getScaleLevelOrder()
  const { minVisibleDurationMs, maxVisibleDurationMs } = getScaleDurationBounds()
  const getNowPercent = (focusTimeMs: number, visibleDurationMs: number) => {
    const { startTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
    return (now.getTime() - startTimeMs) / visibleDurationMs
  }

  useEffect(() => {
    const updateIntervalMs = SCALE_LEVEL_CONFIG[activeScaleLevel].key === 'minute' ? 10 : 1000
    const currentNow = getNow()
    const timeUntilNextUpdate = updateIntervalMs - (currentNow.getTime() % updateIntervalMs || updateIntervalMs)

    let intervalId: number | undefined
    const timeoutId = window.setTimeout(() => {
      setNow(getNow())

      intervalId = window.setInterval(() => {
        setNow(getNow())
      }, updateIntervalMs)
    }, timeUntilNextUpdate)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [activeScaleLevel])

  useEffect(() => {
    if (!lockNow) {
      if (lockNowAnchorPercent !== null) {
        setLockNowAnchorPercent(null)
      }
      return
    }

    const anchorPercent = lockNowAnchorPercent ?? LOCK_NOW_DEFAULT_PERCENT
    const nextFocusTimeMs = now.getTime() - (anchorPercent - 0.5) * viewport.visibleDurationMs
    if (nextFocusTimeMs !== viewport.focusTimeMs) {
      setViewport({
        focusTimeMs: nextFocusTimeMs,
        visibleDurationMs: viewport.visibleDurationMs,
        rangeStrategy: 'centered',
      })
    }
  }, [lockNow, lockNowAnchorPercent, now, viewport])

  // + zooms out, counter-intuitively. That is because it selects a larger time scale.
  // TODO: make this more intuitive
  const updateZoomByScaleSteps = (steps: number) => {
    if (steps === 0) {
      return
    }

    setViewport((prevViewport) => {
      const currentScaleLevel = getNearestScaleLevel(prevViewport.visibleDurationMs)
      const currentIndex = scaleLevelOrder.indexOf(currentScaleLevel)
      const nextIndex = Math.min(Math.max(currentIndex + steps, 0), scaleLevelOrder.length - 1)
      const nextScaleLevel = scaleLevelOrder[nextIndex]
      const nextVisibleDurationMs = getScaleLevelVisibleDurationMs(nextScaleLevel)

      if (nextVisibleDurationMs === prevViewport.visibleDurationMs) {
        return prevViewport
      }

      return {
        focusTimeMs: prevViewport.focusTimeMs,
        visibleDurationMs: nextVisibleDurationMs,
        rangeStrategy: 'centered',
      }
    })
  }

  const handleZoom = (direction: '+' | '-') => {
    updateZoomByScaleSteps(direction === '+' ? 1 : -1)
  }

  const handlePan = (direction: '+' | '-' | 'reset') => {
    if (direction !== 'reset') {
      setLockNow(false)
      setLockNowAnchorPercent(null)
    }

    setViewport((prevViewport) => {
      if (direction === 'reset') {
        return {
          focusTimeMs: now.getTime(),
          visibleDurationMs: prevViewport.visibleDurationMs,
          rangeStrategy: 'currentContainingPeriod',
        }
      }

      const activeScaleLevel = getNearestScaleLevel(prevViewport.visibleDurationMs)
      const prevStartTickDate = getViewportStartTickDate(prevViewport)
      const nextBoundaryTimeMs = direction === '+'
        ? SCALE_LEVEL_CONFIG[activeScaleLevel].calculateTickTimeFunc(prevStartTickDate, PAN_AMOUNT)
        : SCALE_LEVEL_CONFIG[activeScaleLevel].calculateTickTimeFunc(prevStartTickDate, -PAN_AMOUNT)
      const boundaryDeltaMs = nextBoundaryTimeMs - prevStartTickDate.getTime()
      const nextFocusTimeMs = prevViewport.focusTimeMs + boundaryDeltaMs

      return {
        focusTimeMs: nextFocusTimeMs,
        visibleDurationMs: prevViewport.visibleDurationMs,
        rangeStrategy: 'centered',
      }
    })
  }

  const handleToggleLayer = (layerId: TimelineLayerId) => {
    setActiveLayerIds((prevLayerIds) => {
      if (prevLayerIds.includes(layerId)) {
        return prevLayerIds.filter((id) => id !== layerId)
      }

      return [...prevLayerIds, layerId]
    })
  }

  const handleWheelPan = (deltaMs: number) => {
    if (deltaMs === 0) {
      return
    }

    setLockNow(false)
    setLockNowAnchorPercent(null)

    setViewport({
      focusTimeMs: viewport.focusTimeMs + deltaMs,
      visibleDurationMs: viewport.visibleDurationMs,
      rangeStrategy: 'centered',
    })
  }

  const handleWheelZoom = (zoomFactor: number) => {
    if (zoomFactor === 1) {
      return
    }

    setViewport((prevViewport) => ({
      focusTimeMs: prevViewport.focusTimeMs,
      visibleDurationMs: Math.min(
        Math.max(prevViewport.visibleDurationMs * zoomFactor, minVisibleDurationMs),
        maxVisibleDurationMs,
      ),
      rangeStrategy: 'centered',
    }))
  }

  const handleToggleLockNow = () => {
    if (lockNow) {
      setLockNow(false)
      setLockNowAnchorPercent(null)
      return
    }

    const nowPercent = getNowPercent(viewport.focusTimeMs, viewport.visibleDurationMs)
    const anchorPercent = nowPercent >= 0 && nowPercent <= 1
      ? nowPercent
      : LOCK_NOW_DEFAULT_PERCENT

    setLockNowAnchorPercent(anchorPercent)
    setLockNow(true)

    if (anchorPercent === LOCK_NOW_DEFAULT_PERCENT && (nowPercent < 0 || nowPercent > 1)) {
      setViewport({
        focusTimeMs: now.getTime(),
        visibleDurationMs: viewport.visibleDurationMs,
        rangeStrategy: 'centered',
      })
    }
  }

  return (
    <>
      <HQ
        now={now}
        scaleLevel={activeScaleLevel}
        firstVisibleTickDate={firstVisibleTickDate}
        handleZoom={handleZoom}
        handlePan={handlePan}
        lockNow={lockNow}
        onToggleLockNow={handleToggleLockNow}
        birthDate={birthDate}
        availableLayers={AVAILABLE_TIMELINE_LAYERS}
        activeLayerIds={activeLayerIds}
        onToggleLayer={handleToggleLayer}
      />
      <Timeline
        environment={timelineEnvironment}
        activeScaleLevel={activeScaleLevel}
        focusTimeMs={viewport.focusTimeMs}
        visibleDurationMs={viewport.visibleDurationMs}
        startTickDate={startTickDate}
        activeLayers={activeLayers}
        onPanTimeDelta={handleWheelPan}
        onZoomByFactor={handleWheelZoom}
      />
    </>
  )
}

export default App
