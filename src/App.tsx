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
  getViewportCenterTimeMs,
  scaleLevelMax,
  scaleLevelMin,
} from './timeline/scales'

const AVAILABLE_TIMELINE_LAYERS = [gregorianLayer, birthdayLayer]

function App() {
  const [now, setNow] = useState(getNow)
  const [viewport, setViewport] = useState<Viewport>(() => createInitialViewport(now))
  const [birthDate] = useState(DEFAULT_BIRTH_DATE)
  const [activeLayerIds, setActiveLayerIds] = useState<TimelineLayerId[]>(['gregorian'])

  const scaleLevel = viewport.scaleLevel
  const startTickDate = getViewportStartTickDate(viewport)
  const activeLayers = AVAILABLE_TIMELINE_LAYERS.filter((layer) => activeLayerIds.includes(layer.id))
  const timelineEnvironment: TimelineEnvironment = {
    now,
    birthDate,
  }

  // update now every second
  // TODO: minute view ticks show a second behind because it takes 1 second to animate to the current time, by which point the second has already passed.
  useEffect(() => {
    const ms = 1000 - now.getMilliseconds()
    const timeout = setTimeout(() => {
      setNow(getNow())
      
      const interval = setInterval(() => {
        setNow(getNow())
      }, 1000)
      
      return () => clearInterval(interval)
    }, ms)
    
    return () => clearTimeout(timeout)
  }, [])

  // + zooms out, counter-intuitively. That is because it selects a larger time scale.
  // TODO: make this more intuitive
  const updateZoomBySteps = (steps: number) => {
    if (steps === 0) {
      return
    }

    setViewport((prevViewport) => {
      const nextScaleLevel = Math.min(
        Math.max(prevViewport.scaleLevel + steps, scaleLevelMin),
        scaleLevelMax,
      )

      if (nextScaleLevel === prevViewport.scaleLevel) {
        return prevViewport
      }

      const prevStartTickDate = getViewportStartTickDate(prevViewport)
      const centerTimeMs = getViewportCenterTimeMs(prevViewport.scaleLevel, prevStartTickDate)

      return {
        focusTimeMs: centerTimeMs,
        scaleLevel: nextScaleLevel,
        rangeStrategy: 'centered',
      }
    })
  }

  const handleZoom = (direction: '+' | '-') => {
    updateZoomBySteps(direction === '+' ? 1 : -1)
  }

  const handlePan = (direction: '+' | '-' | 'reset') => {
    setViewport((prevViewport) => {
      if (direction === 'reset') {
        return {
          focusTimeMs: now.getTime(),
          scaleLevel: prevViewport.scaleLevel,
          rangeStrategy: 'currentContainingPeriod',
        }
      }

      const prevStartTickDate = getViewportStartTickDate(prevViewport)
      const nextBoundaryTimeMs = direction === '+'
        ? SCALE_LEVEL_CONFIG[prevViewport.scaleLevel].calculateTickTimeFunc(prevStartTickDate, PAN_AMOUNT)
        : SCALE_LEVEL_CONFIG[prevViewport.scaleLevel].calculateTickTimeFunc(prevStartTickDate, -PAN_AMOUNT)
      const boundaryDeltaMs = nextBoundaryTimeMs - prevStartTickDate.getTime()

      return {
        focusTimeMs: prevViewport.focusTimeMs + boundaryDeltaMs,
        scaleLevel: prevViewport.scaleLevel,
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

    setViewport((prevViewport) => {
      return {
        focusTimeMs: prevViewport.focusTimeMs + deltaMs,
        scaleLevel: prevViewport.scaleLevel,
        rangeStrategy: 'centered',
      }
    })
  }

  const handleWheelZoom = (steps: number) => {
    updateZoomBySteps(steps)
  }

  return (
    <>
      <HQ
        now={now}
        scaleLevel={scaleLevel}
        startTickDate={startTickDate}
        handleZoom={handleZoom}
        handlePan={handlePan}
        birthDate={birthDate}
        availableLayers={AVAILABLE_TIMELINE_LAYERS}
        activeLayerIds={activeLayerIds}
        onToggleLayer={handleToggleLayer}
      />
      <Timeline
        environment={timelineEnvironment}
        scaleLevel={scaleLevel}
        focusTimeMs={viewport.focusTimeMs}
        startTickDate={startTickDate}
        activeLayers={activeLayers}
        onPanTimeDelta={handleWheelPan}
        onZoomSteps={handleWheelZoom}
      />
    </>
  )
}

export default App
