import React, { useEffect, useState } from 'react';
import { SCALE_CONFIG } from '../timeline/scales';
import {
  combineLayerPoints,
  combineLayerSpans,
  type TimelineEnvironment,
  type TimelineLayer,
} from '../timeline/layers';
import { useAnimatedTimelineState } from '../hooks/useAnimatedTimelineState';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
} from '../timeline/types';
import NowTick from './NowTick';
import Span from './Span';

interface TimelineProps {
    environment: TimelineEnvironment;
    zoom: keyof typeof SCALE_CONFIG;
    firstTickDate: Date;
    activeLayers: TimelineLayer[];
}

function Timeline({environment, zoom, firstTickDate, activeLayers}: TimelineProps) {
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);
  const {
    timelineZoom,
    timelineFirstTickDate,
    prevZoom,
    prevFirstTickDate,
  } = useAnimatedTimelineState(zoom, firstTickDate);

  useEffect(() => {
    const context = {
      environment,
      zoom,
      firstTickDate,
      timelineZoom,
      timelineFirstTickDate,
      prevZoom,
      prevFirstTickDate,
    };

    setTickPoints(combineLayerPoints(activeLayers, context));
    setTimelineSpans(combineLayerSpans(activeLayers, context));
  }, [activeLayers, environment, zoom, timelineZoom, firstTickDate, timelineFirstTickDate, prevZoom, prevFirstTickDate]);

  return (
    <>
      <div className='timeline line' />
      {timelineSpans.map((span) => <Span key={span.id} span={span} />)}
      {tickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick now={environment.now} zoom={zoom} firstTickDate={firstTickDate} />
    </>
  );
}

export default React.memo(Timeline);
