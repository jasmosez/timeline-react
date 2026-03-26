import React, { useEffect, useState } from 'react';
import { ZOOM } from '../timeline/scales';
import { TickPoint } from './Tick';
import type { TimelinePoint } from '../timeline/types';
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
  const [tickPoints, setTickPoints] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    setTickPoints(createTickPoints());
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

  // Create points for both current and previous zoom levels during transition.
  const createTickPoints = () => {
    // TODO: fix this so panning animates properly
    const allTickPoints = new Map<number, TimelinePoint>();

    const addTicksForZoom = (zoomLevel: keyof typeof ZOOM, baseDate: Date, fadeOut: boolean = false) => {
      const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoomLevel];
      for (let i = 0; i < visibleTicks; i++) {
        const tickTime = calculateTickTimeFunc(baseDate, i);
        allTickPoints.set(tickTime, {
          id: `tick-${tickTime}`,
          kind: 'tick',
          timeMs: tickTime,
          zoom: timelineZoom,
          firstTickDate: timelineFirstTickDate,
          fadeOut,
        });
      }
    };

    if (prevZoom !== undefined && prevFirstTickDate !== undefined && timelineZoom == zoom) {
      addTicksForZoom(prevZoom, prevFirstTickDate, true);
    } else if (timelineZoom !== zoom) {
      addTicksForZoom(timelineZoom, timelineFirstTickDate, false);
    }
    addTicksForZoom(zoom, firstTickDate, false);

    return Array.from(allTickPoints.values());
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
      {tickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick now={now} zoom={zoom} firstTickDate={firstTickDate} />
    </>
  );
}

export default React.memo(Timeline);
