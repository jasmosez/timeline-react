import React, { useEffect, useRef, useState } from 'react';
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
    focusTimeMs: number;
    startTickDate: Date;
    activeLayers: TimelineLayer[];
    onPanTimeDelta: (deltaMs: number) => void;
    onZoomSteps: (steps: number) => void;
}

const WHEEL_STEP_THRESHOLD = 40;

function Timeline({environment, zoom, focusTimeMs, startTickDate, activeLayers, onPanTimeDelta, onZoomSteps}: TimelineProps) {
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);
  const zoomDeltaRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    timelineZoom,
    timelineFocusTimeMs,
    prevZoom,
    prevFocusTimeMs,
    isZoomTransitioning,
  } = useAnimatedTimelineState(zoom, focusTimeMs);

  useEffect(() => {
    const context = {
      environment,
      zoom,
      focusTimeMs,
      startTickDate,
      timelineZoom,
      timelineFocusTimeMs,
      prevZoom,
      prevFocusTimeMs,
    };

    setTickPoints(combineLayerPoints(activeLayers, context));
    setTimelineSpans(combineLayerSpans(activeLayers, context));
  }, [activeLayers, environment, zoom, focusTimeMs, startTickDate, timelineZoom, timelineFocusTimeMs, prevZoom, prevFocusTimeMs]);

  const consumeWheelSteps = (accumulatedDelta: number) => {
    if (Math.abs(accumulatedDelta) < WHEEL_STEP_THRESHOLD) {
      return { consumedSteps: 0, remainder: accumulatedDelta };
    }

    const consumedSteps = Math.trunc(accumulatedDelta / WHEEL_STEP_THRESHOLD);
    const remainder = accumulatedDelta - consumedSteps * WHEEL_STEP_THRESHOLD;
    return { consumedSteps, remainder };
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        zoomDeltaRef.current += event.deltaY;
        const { consumedSteps, remainder } = consumeWheelSteps(zoomDeltaRef.current);
        zoomDeltaRef.current = remainder;

        if (consumedSteps !== 0) {
          onZoomSteps(consumedSteps);
        }

        return;
      }

      const viewportHeight = viewportRef.current?.clientHeight || window.innerHeight;
      if (viewportHeight <= 0) {
        return;
      }

      const visibleDurationMs = SCALE_CONFIG[zoom].screenSpan;
      const deltaMs = (event.deltaY / viewportHeight) * visibleDurationMs;
      if (deltaMs !== 0) {
        onPanTimeDelta(deltaMs);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, onPanTimeDelta, onZoomSteps]);

  return (
    <div ref={viewportRef} className='timeline-root' data-animate={isZoomTransitioning}>
      <div className='timeline line' />
      {timelineSpans.map((span) => <Span key={span.id} span={span} />)}
      {tickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick now={environment.now} zoom={zoom} focusTimeMs={focusTimeMs} startTickDate={startTickDate} />
    </div>
  );
}

export default React.memo(Timeline);
