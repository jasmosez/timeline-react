import { useEffect, useState } from 'react'
// import { HDate, HebrewCalendar } from '@hebcal/core'

import './App.css'
import { ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'
import NowTick from './components/NowTick'
import { STARTING_ZOOM } from './config'

function App() {
  const [now, setNow] = useState(new Date())
  const [zoom, setZoom] = useState<keyof typeof ZOOM>(STARTING_ZOOM)
  const [firstTickDate, setFirstTickDate] = useState(ZOOM[zoom].firstTickDateFunc(now))

  // update now every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleZoom = (direction: '+' | '-') => {
    setZoom((prevZoom) => {
      const newZoom = direction === '+' 
        ? Math.min(prevZoom + 1, zoomMax) 
        : Math.max(prevZoom - 1, zoomMin)
      setFirstTickDate(ZOOM[newZoom].firstTickDateFunc(now))
      return newZoom
    })
  }

  return (
    <>
      <HQ now={now} zoom={zoom} handlezoom={handleZoom} />
      <Timeline zoom={zoom} firstTickDate={firstTickDate} />
      <NowTick now={now} zoom={zoom} firstTickDate={firstTickDate} />
    </>
  )
  
}

export default App
