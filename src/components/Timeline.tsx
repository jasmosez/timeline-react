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
  const [prevFirstTickDate, setPrevFirstTickDate] = useState<Date>();
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
    const allTicks = new Map<number, React.ReactElement>();
    
    // Helper function to create or update a tick element
    const createOrUpdateTickElement = (
      tickTime: number, 
      index: number,
      existingElement?: React.ReactElement,
      fadeOut: boolean = false
    ) => {
      const newProps = {
        tickTime,
        zoom: timelineZoom,
        firstTickDate: timelineFirstTickDate,
        index,
        fadeOut
      };

      // If we have an existing element and it's a Tick component, update its props
      if (existingElement && React.isValidElement(existingElement)) {
        return React.cloneElement(existingElement, newProps);
      }
      
      // Otherwise create a new Tick
      return <Tick {...newProps} key={tickTime} />;
    };

    // Function to add ticks for a specific zoom level
    const addTicksForZoom = (zoomLevel: keyof typeof ZOOM, baseDate: Date, fadeOut: boolean = false) => {
      const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoomLevel];
      for (let i = 0; i < visibleTicks; i++) {
        // Calculate tick time based on the target zoom level's function and base date
        const tickTime = calculateTickTimeFunc(baseDate, i);
        const existingTick = allTicks.get(tickTime);
        allTicks.set(
          tickTime, 
          createOrUpdateTickElement(tickTime, i, existingTick, fadeOut)
        );
      }
    };

    // Add ticks for both zoom levels - this creates the ticks at their target positions
    // but they will all initially render using timelineZoom for positioning
    if (prevZoom !== undefined && prevFirstTickDate !== undefined && timelineZoom == zoom) {
      addTicksForZoom(prevZoom, prevFirstTickDate, true);
    } else if (timelineZoom !== zoom) {
      addTicksForZoom(timelineZoom, timelineFirstTickDate, false);
    }
    addTicksForZoom(zoom, firstTickDate, false);

    return Array.from(allTicks.values());
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