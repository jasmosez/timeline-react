import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { ZOOM, zoomMax, zoomMin } from './utils'
import HQ from './hq'


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
      <HQ now={now} zoom={zoom} handlezoom={handlezoom} />
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