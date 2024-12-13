import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type zoomLevel = {
  key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
  label: string,
  visibleTicks: number,
  unit: 'minute' | 'hour' | 'day' | 'month'
}

const ZOOM: Record<number, zoomLevel> = {
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute'
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour'
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day'
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day'
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month'
  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month'
  }
}


function App() {
  const [count, setCount] = useState(0)
  const [zoom, setZoom] = useState<number>(1)
  const [now, setNow] = useState(new Date())
  const visibleTicks = ZOOM[zoom].visibleTicks

  // update now every second
  setInterval(() => {
    setNow(new Date())
  }, 1000)


  
  const initialDiv = (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <h1 className="read-the-docs">
        Click on the Vite and React logos to learn more
      </h1>
    </>
  )

  const handlezoom = (direction: '+' | '-') => {
    if (direction === '+') {
      setZoom((zoom) => zoom < 5 ? zoom + 1 : zoom)
    } else {
      setZoom((zoom) => zoom > 0 ? zoom - 1 : zoom)
    }
  }

  const timeline = (
    <div className='timeline line' style={
      {
        position: 'absolute',
        height: '100%',
        width: '1px',
        backgroundColor: 'black',
        left: '50%',
        top: '0',
      }
    } />
  )

  const ticks = []
  for (let i = 0; i < ZOOM[zoom].visibleTicks; i++) {
    const tickGapPercentage = 100/visibleTicks
    const halfGap = tickGapPercentage/2
    ticks.push(
      <div className='timeline tick' style={
        {
          position: 'absolute',
          height: '1px',
          width: '10px',
          backgroundColor: 'black',
          top: `${i * tickGapPercentage + halfGap}%`,
          transform: `translateX(-50%)`,

        }
      } />
    )
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '25px',
        left: '25px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <div>
          <button disabled={zoom === 0} onClick={() => handlezoom('-')}>-</button>
          <button disabled={zoom === 5} onClick={() => handlezoom('+')}>+</button>
        </div>
        <div style={{ padding: '10px', textAlign: 'left' }}>
          <p>Viewing one {ZOOM[zoom].label}</p>
          <p>Each tick represents {ZOOM[zoom].unit}</p>
        </div>
      </div>

      {timeline}
      {ticks}
    </>
  )
  
}

export default App

