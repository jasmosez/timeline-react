import React, { useEffect, useRef, useState } from 'react';
import { ZOOM } from '../utils';
import Tick from './Tick';
import Span from './Span';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function Timeline({zoom, firstTickDate}: TimelineProps) {
  const [timelineZoom, setTimelineZoom] = useState<keyof typeof ZOOM>(zoom);
  const [timelineFirstTickDate, setTimelineFirstTickDate] = useState<Date>(firstTickDate);
  const [prevZoom, setPrevZoom] = useState<keyof typeof ZOOM>();
  const [prevFirstTickDate, setPrevFirstTickDate] = useState<Date>();
  const [ticks, setTicks] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    setTicks(createTicks());
    if (zoom !== timelineZoom || firstTickDate !== timelineFirstTickDate) {
      console.log('if')
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


    // On initial render, previous zoom is undefined. Use timelineZoom as the prior zoom is a no-op
    // On the first pass of a zoom transition, all three are different and timelineZoom is the prior zoom
    // On the second pass of a zoom transition, timelineZoom is the new zoom and prevZoom is the prior zoom
    const priorZoom = !!prevZoom && timelineZoom === zoom ? prevZoom : timelineZoom;
    const priorFirstTickDate = !!prevFirstTickDate && timelineFirstTickDate === firstTickDate ? prevFirstTickDate : timelineFirstTickDate;

    // Create ticks for the prior zoom level
    const { calculateTickTimeFunc, visibleTicks } = ZOOM[priorZoom];
    for (let i = 0; i < visibleTicks; i++) {
      const tickTime = calculateTickTimeFunc(priorFirstTickDate, i);
      const existingTickIndex = allTicks.findIndex(t => t.tickTime === tickTime);
      if (existingTickIndex < 0) {
        allTicks.push({
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={priorZoom}
            firstTickDate={priorFirstTickDate}
            index={i}
          />
        });
      }
    }

    if (timelineZoom !== zoom || timelineFirstTickDate !== firstTickDate) {
      console.log('update ticks for the new zoom level');
      // update ticks for the new zoom level
      allTicks.forEach(t => {
        t.element = <Tick
          key={t.tickTime}
          tickTime={t.tickTime}
          zoom={zoom}
          firstTickDate={firstTickDate}
          index={t.element.props.index}
        />
      });
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
    </>
  );
}

export default React.memo(Timeline);