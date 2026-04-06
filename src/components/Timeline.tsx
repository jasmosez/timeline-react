import React, { useEffect, useRef, useState } from 'react';
import type { ScaleLevel } from '../timeline/scales';
import {
  combineLayerPoints,
  combineLayerSpans,
  type LeadingCalendarSystemId,
  type TimelineEnvironment,
  type TimelineLayer,
} from '../timeline/layers';
import { getGregorianContextLabel } from '../timeline/gregorianScaleConfig';
import { getHebrewContextLabel } from '../timeline/hebrewLabels';
import { getVisibleTimeRange } from '../timeline/scales';
import { TickPoint } from './Tick';
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
} from '../timeline/types';
import NowTick from './NowTick';
import Span from './Span';
import { useStickyContextPresentation } from './useStickyContextPresentation';

interface TimelineProps {
    environment: TimelineEnvironment;
    leadingCalendarSystemId: LeadingCalendarSystemId;
    activeScaleLevel: ScaleLevel;
    focusTimeMs: number;
    visibleDurationMs: number;
    startTickDate: Date;
    activeLayers: TimelineLayer[];
    isGregorianVisible: boolean;
    isHebrewVisible: boolean;
    onPanTimeDelta: (deltaMs: number) => void;
    onZoomByFactor: (factor: number, anchorPercent: number) => void;
}

type PromotedSpanLabel = {
  id: string
  label: string
  className: string
}

export const getPromotedSpanLabels = (
  spans: PositionedTimelineSpan[],
  visibleTimeRange: ReturnType<typeof getVisibleTimeRange>,
) => {
  const labelsBySide = new Map<'leading' | 'supporting', PromotedSpanLabel>()

  spans.forEach((span) => {
    if (span.kind !== 'structural-period') {
      return
    }

    if (!(span.startTimeMs < visibleTimeRange.startTimeMs && span.endTimeMs > visibleTimeRange.endTimeMs)) {
      return
    }

    if (!span.side || labelsBySide.has(span.side) || !span.label) {
      return
    }

    labelsBySide.set(span.side, {
      id: `promoted-span-label-${span.id}`,
      label: `... ${span.label}`,
      className: [
        'timeline',
        'tick-label',
        'promoted-span-label',
        span.side === 'leading' ? 'structural-label-leading' : 'structural-label-supporting',
        span.labelTheme === 'hebrew' ? 'hebrew-label' : '',
      ].join(' ').trim(),
    })
  })

  return [...labelsBySide.values()]
}

function Timeline({
  environment,
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  startTickDate,
  activeLayers,
  isGregorianVisible,
  isHebrewVisible,
  onPanTimeDelta,
  onZoomByFactor,
}: TimelineProps) {
  const [tickPoints, setTickPoints] = useState<PositionedTimelinePoint[]>([]);
  const [timelineSpans, setTimelineSpans] = useState<PositionedTimelineSpan[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = {
      environment,
      leadingCalendarSystemId,
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
    leadingCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    startTickDate,
  ]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const viewportElement = viewportRef.current
      const eventTarget = event.target

      if (!(eventTarget instanceof Node) || !viewportElement?.contains(eventTarget)) {
        return
      }

      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const zoomFactor = Math.exp(event.deltaY * 0.0015)
        const viewportRect = viewportElement.getBoundingClientRect()
        const anchorPercent = Math.min(
          Math.max((event.clientY - viewportRect.top) / viewportRect.height, 0),
          1,
        )
        onZoomByFactor(zoomFactor, anchorPercent)

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

  const visibleTimeRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const gregorianStickyContextLabelTop = isGregorianVisible
    ? getGregorianContextLabel(
        activeScaleLevel,
        visibleTimeRange.startTimeMs,
      )
    : undefined
  const gregorianStickyContextLabelBottom = isGregorianVisible
    ? getGregorianContextLabel(
        activeScaleLevel,
        visibleTimeRange.endTimeMs - 1,
      )
    : undefined
  const hebrewStickyContextLabelTop = isHebrewVisible
    ? getHebrewContextLabel(
        activeScaleLevel,
        visibleTimeRange.startTimeMs,
        environment,
      )
    : undefined
  const hebrewStickyContextLabelBottom = isHebrewVisible
    ? getHebrewContextLabel(
        activeScaleLevel,
        visibleTimeRange.endTimeMs - 1,
        environment,
      )
    : undefined
  const {
    contextLabelRefs,
    contextLabelStyle,
    birthdayLabelLaneClass,
    gregorianContextSideClass,
    hebrewContextSideClass,
    singleStructuralContextVisible,
  } = useStickyContextPresentation({
    viewportRef,
    isGregorianVisible,
    isHebrewVisible,
    leadingCalendarSystemId,
    gregorianTopLabel: gregorianStickyContextLabelTop,
    gregorianBottomLabel: gregorianStickyContextLabelBottom,
    hebrewTopLabel: hebrewStickyContextLabelTop,
    hebrewBottomLabel: hebrewStickyContextLabelBottom,
  })
  const displayTickPoints = tickPoints.map((point) =>
    point.className?.includes('birthday-marker')
      ? {
          ...point,
          className: `${point.className} ${singleStructuralContextVisible ? 'birthday-marker-secondary-lane' : 'birthday-marker-outer-lane'}`.trim(),
          labelClassName: `${point.labelClassName ?? ''} ${birthdayLabelLaneClass}`.trim(),
        }
      : point,
  )
  const promotedSpanLabels = getPromotedSpanLabels(timelineSpans, visibleTimeRange)

  return (
    <div ref={viewportRef} className='timeline-root'>
      <div className='timeline line' />
      {gregorianStickyContextLabelTop ? (
        <>
          <div
            ref={(element) => { contextLabelRefs.current[0] = element }}
            style={contextLabelStyle}
            className={`timeline structural-context-label gregorian-context-label gregorian-context-label-top ${gregorianContextSideClass}`}
          >
            {gregorianStickyContextLabelTop}
          </div>
          {gregorianStickyContextLabelBottom ? (
            <div
              ref={(element) => { contextLabelRefs.current[1] = element }}
              style={contextLabelStyle}
              className={`timeline structural-context-label gregorian-context-label gregorian-context-label-bottom ${gregorianContextSideClass}`}
            >
              {gregorianStickyContextLabelBottom}
            </div>
          ) : null}
        </>
      ) : null}
      {hebrewStickyContextLabelTop ? (
        <>
          <div
            ref={(element) => { contextLabelRefs.current[2] = element }}
            style={contextLabelStyle}
            className={`timeline structural-context-label hebrew-context-label hebrew-context-label-top ${hebrewContextSideClass}`}
          >
            {hebrewStickyContextLabelTop}
          </div>
          {hebrewStickyContextLabelBottom ? (
            <div
              ref={(element) => { contextLabelRefs.current[3] = element }}
              style={contextLabelStyle}
              className={`timeline structural-context-label hebrew-context-label hebrew-context-label-bottom ${hebrewContextSideClass}`}
            >
              {hebrewStickyContextLabelBottom}
            </div>
          ) : null}
        </>
      ) : null}
      {promotedSpanLabels.map((promotedLabel) => (
        <div key={promotedLabel.id} className={promotedLabel.className}>
          {promotedLabel.label}
        </div>
      ))}
      {timelineSpans.map((span) => <Span key={span.id} span={span} />)}
      {displayTickPoints.map((point) => <TickPoint key={point.id} point={point} />)}
      <NowTick
        now={environment.now}
        environment={environment}
        leadingCalendarSystemId={leadingCalendarSystemId}
        scaleLevel={activeScaleLevel}
        focusTimeMs={focusTimeMs}
        visibleDurationMs={visibleDurationMs}
        startTickDate={startTickDate}
      />
    </div>
  );
}

export default React.memo(Timeline);
