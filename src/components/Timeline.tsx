import React from 'react';
import { ZOOM, getPointPercent } from '../utils';

// import MockDate from 'mockdate';

// // Set the mock date to a specific time for testing
// MockDate.set('2023-01-01T04:00:00Z');
// // Reset the mock date after tests
// MockDate.reset();

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function Timeline({zoom, firstTickDate}: TimelineProps) {
  const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoom]

  const ticks = []
  for (let i = 0; i < visibleTicks; i++) {
    const tickTime = calculateTickTimeFunc(firstTickDate, i)
    ticks.push(
      <div key={i} className='timeline tick' style={{
          top: getPointPercent(tickTime, zoom, firstTickDate),
      }}>
        <div className='timeline tick-label'>
            {ZOOM[zoom].renderTickLabel(tickTime, i === 0)}
        </div>
      </div>
    )
  }

  const spans = []
  for (let i = 0; i < visibleTicks; i++) {
    spans.push(
      <div 
        key={i} 
        className='timeline span' 
        style={{
          top: `calc(${getPointPercent(calculateTickTimeFunc(firstTickDate, i), zoom, firstTickDate)} + 2px)`,
          width: '15px',
          height: `calc(${100 / visibleTicks}% - 4px)`,
          backgroundColor: 'pink',
          transform: 'translateX(-50%)',
        }}
        onClick={() => console.log('click', new Date(calculateTickTimeFunc(firstTickDate, i)).toLocaleString())}
      />
    )
  }

  return (
    <>
      {/* {spans} */}
      <div className='timeline line' />
      {ticks}
    </>
  )

}

export default React.memo(Timeline);