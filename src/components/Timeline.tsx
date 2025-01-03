import React from 'react';
import { ZOOM } from '../utils';
import Tick from './Tick';
import Span from './Span';

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
      <Tick
        key={tickTime}
        tickTime={tickTime}
        zoom={zoom}
        firstTickDate={firstTickDate}
        index={i}
      />
    )
  }

  const spans = []
  for (let i = 0; i < visibleTicks; i++) {
    const tickTime = calculateTickTimeFunc(firstTickDate, i)
    spans.push(
      <Span
        key={i}
        tickTime={tickTime}
        zoom={zoom}
        firstTickDate={firstTickDate}
        visibleTicks={visibleTicks}
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