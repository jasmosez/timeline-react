import { useEffect, useState } from 'react'
// import { HDate, HebrewCalendar } from '@hebcal/core'

import './App.css'
import { getNow, ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'
import { STARTING_ZOOM, PAN_AMOUNT } from './config'

function App() {
  const [now, setNow] = useState(getNow)
  const [zoom, setZoom] = useState<keyof typeof ZOOM>(STARTING_ZOOM)
  const [firstTickDate, setFirstTickDate] = useState(ZOOM[zoom].firstTickDateFunc(now))

  // update now every second
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
    setZoom((prevZoom) => {
      const newZoom = direction === '+' 
        ? Math.min(prevZoom + 1, zoomMax) 
        : Math.max(prevZoom - 1, zoomMin)
      setFirstTickDate(ZOOM[newZoom].firstTickDateFunc(now))
      return newZoom
    })
  }

  const handlePan = (direction: '+' | '-' | 'reset') => {
    setFirstTickDate((prevFirstTickDate) => {
      if (direction === 'reset') {
        return ZOOM[zoom].firstTickDateFunc(now)
      } else {
        return direction === '+' 
          ? new Date(ZOOM[zoom].calculateTickTimeFunc(prevFirstTickDate, PAN_AMOUNT))
          : new Date(ZOOM[zoom].calculateTickTimeFunc(prevFirstTickDate, -PAN_AMOUNT))
      }
    })
  }

  return (
    <>
      <HQ now={now} zoom={zoom} firstTickDate={firstTickDate} handleZoom={handleZoom} handlePan={handlePan} />
      <Timeline now={now} zoom={zoom} firstTickDate={firstTickDate}/>
    </>
  )
  
}

export default App
