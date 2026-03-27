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
  SCALE_CONFIG,
  getViewportCenterTimeMs,
  zoomMax,
  zoomMin,
} from './timeline/scales'

const AVAILABLE_TIMELINE_LAYERS = [gregorianLayer, birthdayLayer]

function App() {
  const [now, setNow] = useState(getNow)
  const [viewport, setViewport] = useState<Viewport>(() => createInitialViewport(now))
  const [birthDate] = useState(DEFAULT_BIRTH_DATE)
  const [activeLayerIds, setActiveLayerIds] = useState<TimelineLayerId[]>(['gregorian'])

  const zoom = viewport.zoomLevel
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

  // + is zoom out, counter-intuitively. That is because it is a larger amount of time.
  // TODO: make this more intuitive
  const updateZoomBySteps = (steps: number) => {
    if (steps === 0) {
      return
    }

    setViewport((prevViewport) => {
      const newZoom = Math.min(Math.max(prevViewport.zoomLevel + steps, zoomMin), zoomMax)

      if (newZoom === prevViewport.zoomLevel) {
        return prevViewport
      }

      const prevStartTickDate = getViewportStartTickDate(prevViewport)
      const centerTimeMs = getViewportCenterTimeMs(prevViewport.zoomLevel, prevStartTickDate)

      return {
        focusTimeMs: centerTimeMs,
        zoomLevel: newZoom,
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
          zoomLevel: prevViewport.zoomLevel,
          rangeStrategy: 'currentContainingPeriod',
        }
      }

      const prevStartTickDate = getViewportStartTickDate(prevViewport)
      const nextBoundaryTimeMs = direction === '+'
        ? SCALE_CONFIG[prevViewport.zoomLevel].calculateTickTimeFunc(prevStartTickDate, PAN_AMOUNT)
        : SCALE_CONFIG[prevViewport.zoomLevel].calculateTickTimeFunc(prevStartTickDate, -PAN_AMOUNT)
      const boundaryDeltaMs = nextBoundaryTimeMs - prevStartTickDate.getTime()

      return {
        focusTimeMs: prevViewport.focusTimeMs + boundaryDeltaMs,
        zoomLevel: prevViewport.zoomLevel,
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
        zoomLevel: prevViewport.zoomLevel,
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
        zoom={zoom}
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
        zoom={zoom}
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
