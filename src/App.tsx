import { useEffect, useState } from 'react'
// import { HDate, HebrewCalendar } from '@hebcal/core'

import './App.css'
import { getNow, ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'
import { PAN_AMOUNT, DEFAULT_BIRTH_DATE } from './config'
import { createInitialViewport, getViewportFirstTickDate, type Viewport } from './viewport'

function App() {
  const [now, setNow] = useState(getNow)
  const [viewport, setViewport] = useState<Viewport>(() => createInitialViewport(now))
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE)

  const zoom = viewport.zoomLevel
  const firstTickDate = getViewportFirstTickDate(viewport)

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
  const handleZoom = (direction: '+' | '-') => {
    setViewport((prevViewport) => {
      const newZoom = direction === '+'
        ? Math.min(prevViewport.zoomLevel + 1, zoomMax)
        : Math.max(prevViewport.zoomLevel - 1, zoomMin)

      return {
        focusTimeMs: now.getTime(),
        zoomLevel: newZoom,
        rangeStrategy: 'currentContainingPeriod',
      }
    })
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

      const prevFirstTickDate = getViewportFirstTickDate(prevViewport)
      const nextFirstTickTimeMs = direction === '+'
        ? ZOOM[prevViewport.zoomLevel].calculateTickTimeFunc(prevFirstTickDate, PAN_AMOUNT)
        : ZOOM[prevViewport.zoomLevel].calculateTickTimeFunc(prevFirstTickDate, -PAN_AMOUNT)

      return {
        focusTimeMs: nextFirstTickTimeMs,
        zoomLevel: prevViewport.zoomLevel,
        rangeStrategy: 'custom',
        customFirstTickTimeMs: nextFirstTickTimeMs,
      }
    })
  }

  return (
    <>
      <HQ now={now} zoom={zoom} firstTickDate={firstTickDate} handleZoom={handleZoom} handlePan={handlePan} birthDate={birthDate} />
      <Timeline now={now} zoom={zoom} firstTickDate={firstTickDate}/>
    </>
  )
}

export default App
