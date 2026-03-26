import React, { useEffect, useState } from 'react';
import { SCALE_CONFIG } from '../timeline/scales';
import { createGregorianStructuralSpans, createGregorianTickPoints } from '../timeline/gregorian';
import { useAnimatedTimelineState } from '../hooks/useAnimatedTimelineState';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
} from '../timeline/types';
import NowTick from './NowTick';
import Span from './Span';

interface TimelineProps {
    zoom: keyof typeof SCALE_CONFIG;
    firstTickDate: Date;
    now: Date;
}

function Timeline({zoom, firstTickDate, now}: TimelineProps) {
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);
  const {
    timelineZoom,
    timelineFirstTickDate,
    prevZoom,
    prevFirstTickDate,
  } = useAnimatedTimelineState(zoom, firstTickDate);

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
