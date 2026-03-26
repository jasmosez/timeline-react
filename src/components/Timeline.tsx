import React, { useEffect, useState } from 'react';
import { ZOOM } from '../timeline/scales';
import {
  createStructuralSpans as createTimelineStructuralSpans,
  positionTimelinePoint,
  positionTimelineSpan,
} from '../timeline/layout';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
  TimelineSpan,
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
    setTickPoints(createTickPoints());
    setTimelineSpans(createPositionedStructuralSpans());
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
    const allTickPoints = new Map<number, PositionedTimelinePoint>();

    const addTicksForZoom = (zoomLevel: keyof typeof ZOOM, baseDate: Date, fadeOut: boolean = false) => {
      const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoomLevel];
      for (let i = 0; i < visibleTicks; i++) {
        const tickTime = calculateTickTimeFunc(baseDate, i);
        const point: TimelinePoint = {
          id: `tick-${tickTime}`,
          kind: 'tick',
          timeMs: tickTime,
        };

        allTickPoints.set(
          tickTime,
          positionTimelinePoint(point, timelineZoom, timelineFirstTickDate, {
            opacity: fadeOut ? 0 : 1,
          }),
        );
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

  const createPositionedStructuralSpans = () => {
    return createTimelineStructuralSpans(zoom, firstTickDate).map((span: TimelineSpan) =>
      positionTimelineSpan(span, zoom, firstTickDate, { className: 'structural-span' }),
    );
  };

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
