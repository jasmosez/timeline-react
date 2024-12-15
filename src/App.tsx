import { useState } from 'react'
import './App.css'
import { ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'

const STARTING_ZOOM = 1

function App() {
  const [now, setNow] = useState(new Date())
  const [zoom, setZoom] = useState<keyof typeof ZOOM>(STARTING_ZOOM)
  const [firstTick, setFirstTick] = useState(ZOOM[zoom].firstTickFunc(now))

  // update now every second
  setInterval(() => {
    setNow(new Date())
  }, 1000)

  const handleZoom = (direction: '+' | '-') => {
    setZoom((prevZoom) => {
      const newZoom = direction === '+' 
        ? Math.min(prevZoom + 1, zoomMax) 
        : Math.max(prevZoom - 1, zoomMin)
      setFirstTick(ZOOM[newZoom].firstTickFunc(now))
      return newZoom
    })
  }

  return (
    <>
      <HQ now={now} zoom={zoom} handlezoom={handleZoom} />
      <Timeline now={now} zoom={zoom} firstTick={firstTick} />
    </>
  )
  
}

export default App
