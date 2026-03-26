import { ZOOM, getPointPercent, getTickLabel } from '../timeline/scales';
import type { PositionedTimelinePoint } from '../timeline/types';

interface BaseTickProps {
    tickTime: number;
    className?: string;
    labelClassName?: string;
    renderLabel?: () => string | undefined;
    opacity?: number;
}

type RawTickProps = BaseTickProps & {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    top?: never;
}

type PositionedTickProps = BaseTickProps & {
    top: string;
    zoom?: never;
    firstTickDate?: never;
}

type TickProps = RawTickProps | PositionedTickProps

export function TickPoint({ point }: { point: PositionedTimelinePoint }) {
    return (
        <Tick
            tickTime={point.timeMs}
            top={point.top}
            opacity={point.opacity}
            className={point.className}
            labelClassName={point.labelClassName}
            renderLabel={point.label ? () => point.label : undefined}
        />
    );
}

function Tick({ tickTime, className = '', labelClassName = '', renderLabel, opacity, ...positioningProps }: TickProps) {
    const isPositionedTick = 'top' in positioningProps;
    const top = isPositionedTick
        ? positioningProps.top
        : getPointPercent(tickTime, positioningProps.zoom, positioningProps.firstTickDate);
    const resolvedLabel = renderLabel
        ? renderLabel()
        : isPositionedTick
            ? undefined
            : getTickLabel(tickTime, positioningProps.zoom, positioningProps.firstTickDate);

    return (
        <div className={`timeline tick ${className}`} style={{
            top,
            opacity: opacity ?? 1,
        }}>
            <div className={`timeline tick-label ${labelClassName}`}>
                {resolvedLabel}
            </div>
        </div>
    );
}

export default Tick;
