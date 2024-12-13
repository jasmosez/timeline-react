import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

type zoomLevel = {
  key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
  label: string,
  visibleTicks: number,
  unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
  incrementFunc: (firstTick: Date, i: number) => number
}
const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * 60 * 1000
const addHours = (date: Date, hours: number) => date.getTime() + hours * 60 * 60 * 1000
const addDays = (date: Date, days: number) => date.getTime() + days * 24 * 60 * 60 * 1000
const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date)
  newDate.setMonth(date.getMonth() + months)
  return newDate.getTime()
}
const addYears = (date: Date, years: number) => {
  const newDate = new Date(date)
  newDate.setFullYear(date.getFullYear() + years)
  return newDate.getTime()
}
const ZOOM: Record<number, zoomLevel> = {
  0: {
    key: 'hour',
    label: 'Hour',
    visibleTicks: 61,
    unit: 'minute',
    incrementFunc: addMinutes
  },
  1: {
    key: 'day',
    label: 'Day',
    visibleTicks: 25,
    unit: 'hour',
    incrementFunc: addHours
  },
  2: {
    key: 'week',
    label: 'Week',
    visibleTicks: 8,
    unit: 'day',
    incrementFunc: addDays
  },
  3: {
    key: 'month',
    label: 'Month',
    visibleTicks: 32,
    unit: 'day',
    incrementFunc: addDays
  },
  4: {
    key: 'quarter',
    label: 'Quarter',
    visibleTicks: 4,
    unit: 'month',
    incrementFunc: addMonths

  },
  5: {
    key: 'year',
    label: 'Year',
    visibleTicks: 13,
    unit: 'month',
    incrementFunc: addMonths
  },
  6: {
    key: 'shmita',
    label: 'Shmita Cycle',
    visibleTicks: 8,
    unit: 'year',
    incrementFunc: addYears
  },
  7: {
    key: 'decade',
    label: 'Decade',
    visibleTicks: 11,
    unit: 'year',
    incrementFunc: addYears
  }
}
// get the max ZOOM key value
const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))
const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))
console.log({zoomMax, zoomMin})


function App() {
  // const [count, setCount] = useState(0)
  const [zoom, setZoom] = useState<keyof typeof ZOOM>(1)
  const [now, setNow] = useState(new Date())
  const [firstTick, setFirstTick] = useState(now)
  const visibleTicks = ZOOM[zoom].visibleTicks

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
      <div key={i} className='timeline tick' style={
        {
          position: 'absolute',
          height: '1px',
          width: '10px',
          backgroundColor: 'black',
          top: `${i * tickGapPercentage + halfGap}%`,
          transform: `translateX(-50%)`,
        }
      }>
        <div style={{
        position: 'absolute',
        left: '15px', // Adjust as needed
        transform: 'translateY(-50%)',
        whiteSpace: 'nowrap',
      }}>
            {new Date(ZOOM[zoom].incrementFunc(firstTick, i)).toLocaleString()}
        </div>

      </div>
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
          <button disabled={zoom === zoomMin} onClick={() => handlezoom('-')}>-</button>
          <button disabled={zoom === zoomMax} onClick={() => handlezoom('+')}>+</button>
        </div>
        <div style={{ padding: '10px', textAlign: 'left' }}>
          <p>Viewing one {ZOOM[zoom].label}</p>
          <p>Each tick represents {ZOOM[zoom].unit}</p>
          <p>{now.toLocaleString()}</p>
        </div>
      </div>

      {timeline}
      {ticks}
    </>
  )
  
}

export default App


// const initialDiv = (
//   <>
//     <div>
//       <a href="https://vite.dev" target="_blank">
//         <img src={viteLogo} className="logo" alt="Vite logo" />
//       </a>
//       <a href="https://react.dev" target="_blank">
//         <img src={reactLogo} className="logo react" alt="React logo" />
//       </a>
//     </div>
//     <h1>Vite + React</h1>
//     <div className="card">
//       <button onClick={() => setCount((count) => count + 1)}>
//         count is {count}
//       </button>
//       <p>
//         Edit <code>src/App.tsx</code> and save to test HMR
//       </p>
//     </div>
//     <h1 className="read-the-docs">
//       Click on the Vite and React logos to learn more
//     </h1>
//   </>
// )