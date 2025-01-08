import React, { useEffect, useState } from 'react';
import { ZOOM } from '../utils';
import Tick from './Tick';
import NowTick from './NowTick';
// import Span from './Span';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    now: Date;
}

function Timeline({zoom, firstTickDate, now}: TimelineProps) {
  const [timelineZoom, setTimelineZoom] = useState<keyof typeof ZOOM>(zoom);
  const [timelineFirstTickDate, setTimelineFirstTickDate] = useState<Date>(firstTickDate);
  const [prevZoom, setPrevZoom] = useState<keyof typeof ZOOM>();
  const [, setPrevFirstTickDate] = useState<Date>();
  const [ticks, setTicks] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    setTicks(createTicks());
    if (zoom !== timelineZoom || firstTickDate !== timelineFirstTickDate) {
      setPrevZoom(timelineZoom);
      setPrevFirstTickDate(timelineFirstTickDate);

      // Allow initial render at old positions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimelineZoom(zoom);
          setTimelineFirstTickDate(firstTickDate);

        });
      });

    }
  }, [zoom, timelineZoom, firstTickDate, timelineFirstTickDate]);

  // Create ticks for both current and previous zoom levels during transition
  const createTicks = () => {
    console.log('createTicks', {prevZoom, timelineZoom, zoom});
    const allTicks: { tickTime: number; element: React.ReactElement }[] = [];
    
    // Create ticks for the target zoom level first
    if (true) {
      const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoom];
      for (let i = 0; i < visibleTicks; i++) {
        const tickTime = calculateTickTimeFunc(firstTickDate, i);
        allTicks.push({
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={timelineZoom}
            firstTickDate={timelineFirstTickDate}
            index={i}
          />
        });
      }
    }

    // Add or update ticks from the previous zoom level
    const { calculateTickTimeFunc, visibleTicks } = ZOOM[timelineZoom];
    for (let i = 0; i < visibleTicks; i++) {
      const tickTime = calculateTickTimeFunc(timelineFirstTickDate, i);
      const existingTickIndex = allTicks.findIndex(t => t.tickTime === tickTime);
      if (existingTickIndex < 0) {
        allTicks.push({
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={true ? zoom : timelineZoom}
            firstTickDate={true ? firstTickDate : timelineFirstTickDate}
            index={i}
          />
        });
      }
    }

    return allTicks.map(t => t.element);
  };


  // const spans = [];
  // const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoom];
  // for (let i = 0; i < visibleTicks; i++) {
  //   const tickTime = calculateTickTimeFunc(firstTickDate, i);
  //   spans.push(
  //     <Span
  //       key={i}
  //       tickTime={tickTime}
  //       zoom={zoom}
  //       firstTickDate={firstTickDate}
  //       visibleTicks={visibleTicks}
  //     />
  //   );
  // }

  return (
    <>
      {/* {spans} */}
      <div className='timeline line' />
      {ticks}
      <NowTick now={now} zoom={zoom} firstTickDate={firstTickDate} />
    </>
  );
}

export default React.memo(Timeline);