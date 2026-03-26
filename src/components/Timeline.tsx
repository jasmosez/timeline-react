import React, { useEffect, useState } from 'react';
import { ZOOM } from '../timeline/scales';
import { createGregorianStructuralSpans, createGregorianTickPoints } from '../timeline/gregorian';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
} from '../timeline/types';
import NowTick from './NowTick';
import Span from './Span';

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
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);

  useEffect(() => {
    setTickPoints(
      createGregorianTickPoints({
        zoom,
        firstTickDate,
        timelineZoom,
        timelineFirstTickDate,
        prevZoom,
        prevFirstTickDate,
      }),
    );
    setTimelineSpans(createGregorianStructuralSpans(zoom, firstTickDate));
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
  }, [zoom, timelineZoom, firstTickDate, timelineFirstTickDate, prevZoom, prevFirstTickDate]);

  return (
    <>
      <div className='timeline line' />
      {timelineSpans.map((span) => <Span key={span.id} span={span} />)}
      {tickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick now={now} zoom={zoom} firstTickDate={firstTickDate} />
    </>
  );
}

export default React.memo(Timeline);
