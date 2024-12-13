import { useState } from 'react'
import './App.css'
import { ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'


function App() {
  const [zoom, setZoom] = useState<keyof typeof ZOOM>(1)
  const [now, setNow] = useState(new Date())
  const [firstTick, setFirstTick] = useState(now)

  // update now every second
  setInterval(() => {
    setNow(new Date())
  }, 1000)

  const handlezoom = (direction: '+' | '-') => {
    if (direction === '+') {
      setZoom((zoom) => zoom < zoomMax ? zoom + 1 : zoom)
    } else {
      setZoom((zoom) => zoom > zoomMin ? zoom - 1 : zoom)
    }
  }

  return (
    <>
      <HQ now={now} zoom={zoom} handlezoom={handlezoom} />
      <Timeline zoom={zoom} firstTick={firstTick} />
    </>
  )
  
}

export default App
