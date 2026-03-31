import React, { useEffect, useRef, useState } from 'react';
import type { ScaleLevel } from '../timeline/scales';
import {
  combineLayerPoints,
  combineLayerSpans,
  type PrimaryCalendarSystemId,
  type TimelineEnvironment,
  type TimelineLayer,
} from '../timeline/layers';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
} from '../timeline/types';
import NowTick from './NowTick';
import Span from './Span';

interface TimelineProps {
    environment: TimelineEnvironment;
    primaryCalendarSystemId: PrimaryCalendarSystemId;
    activeScaleLevel: ScaleLevel;
    focusTimeMs: number;
    visibleDurationMs: number;
    startTickDate: Date;
    activeLayers: TimelineLayer[];
    onPanTimeDelta: (deltaMs: number) => void;
    onZoomByFactor: (factor: number) => void;
}

function Timeline({
  environment,
  primaryCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  startTickDate,
  activeLayers,
  onPanTimeDelta,
  onZoomByFactor,
}: TimelineProps) {
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = {
      environment,
      primaryCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      startTickDate,
    };

    setTickPoints(combineLayerPoints(activeLayers, context));
    setTimelineSpans(combineLayerSpans(activeLayers, context));
  }, [
    activeLayers,
    environment,
    primaryCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    startTickDate,
  ]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const zoomFactor = Math.exp(event.deltaY * 0.0015)
        onZoomByFactor(zoomFactor)

        return;
      }

      const viewportHeight = viewportRef.current?.clientHeight || window.innerHeight;
      if (viewportHeight <= 0) {
        return;
      }

      const deltaMs = (event.deltaY / viewportHeight) * visibleDurationMs;
      if (deltaMs !== 0) {
        onPanTimeDelta(deltaMs);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [visibleDurationMs, onPanTimeDelta, onZoomByFactor]);

  return (
    <div ref={viewportRef} className='timeline-root'>
      <div className='timeline line' />
      {timelineSpans.map((span) => <Span key={span.id} span={span} />)}
      {tickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick
        now={environment.now}
        scaleLevel={activeScaleLevel}
        focusTimeMs={focusTimeMs}
        visibleDurationMs={visibleDurationMs}
        startTickDate={startTickDate}
      />
    </div>
  );
}

export default React.memo(Timeline);
