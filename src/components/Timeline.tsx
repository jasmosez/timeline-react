import React, { useEffect, useState } from 'react';
import { ZOOM } from '../utils';
import Tick from './Tick';
import Span from './Span';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function Timeline({zoom, firstTickDate}: TimelineProps) {
  const [prevZoom, setPrevZoom] = useState<keyof typeof ZOOM>(zoom);
  const [prevFirstTickDate, setPrevFirstTickDate] = useState<Date>(firstTickDate);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ticks, setTicks] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    if (zoom !== prevZoom || firstTickDate !== prevFirstTickDate) {
      setIsTransitioning(true);
      setTicks(createTicks());
      
      // Allow initial render at old positions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPrevZoom(zoom);
          setPrevFirstTickDate(firstTickDate);
          setTicks(createTicks());
        });
      });

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        // setTicks(createTicks());
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTicks(createTicks());
    }
  }, [zoom, prevZoom, firstTickDate, prevFirstTickDate]);

  // Create ticks for both current and previous zoom levels during transition
  const createTicks = () => {
    const allTicks: { tickTime: number; element: React.ReactElement }[] = [];
    
    // Create ticks for the target zoom level first
    if (isTransitioning) {
      const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoom];
      for (let i = 0; i < visibleTicks; i++) {
        const tickTime = calculateTickTimeFunc(firstTickDate, i);
        allTicks.push({
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={prevZoom}
            firstTickDate={prevFirstTickDate}
            index={i}
          />
        });
      }
    }

    // Add or update ticks from the previous zoom level
    const { calculateTickTimeFunc, visibleTicks } = ZOOM[prevZoom];
    for (let i = 0; i < visibleTicks; i++) {
      const tickTime = calculateTickTimeFunc(prevFirstTickDate, i);
      const existingTickIndex = allTicks.findIndex(t => t.tickTime === tickTime);
      
      if (existingTickIndex >= 0) {
        // Update existing tick to animate from current position
        allTicks[existingTickIndex] = {
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={isTransitioning ? zoom : prevZoom}
            firstTickDate={isTransitioning ? firstTickDate : prevFirstTickDate}
            index={i}
          />
        };
      } else {
        // Add new tick
        allTicks.push({
          tickTime,
          element: <Tick
            key={tickTime}
            tickTime={tickTime}
            zoom={isTransitioning ? zoom : prevZoom}
            firstTickDate={isTransitioning ? firstTickDate : prevFirstTickDate}
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
      {createTicks()}
    </>
  );
}

export default React.memo(Timeline);