import { ZOOM, getPointPercent, getTickLabel } from '../timeline/scales';
import type { TimelinePoint } from '../timeline/types';

interface TickProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    className?: string;
    labelClassName?: string;
    renderLabel?: () => string | undefined;
    fadeOut?: boolean;
}

export function TickPoint({ point }: { point: TimelinePoint }) {
    return (
        <Tick
            tickTime={point.timeMs}
            zoom={point.zoom}
            firstTickDate={point.firstTickDate}
            fadeOut={point.fadeOut}
            className={point.className}
            labelClassName={point.labelClassName}
            renderLabel={point.label ? () => point.label : undefined}
        />
    );
}

function Tick({ tickTime, zoom, firstTickDate, className = '', labelClassName = '', renderLabel, fadeOut }: TickProps) {
    return (
        <div className={`timeline tick ${className}`} style={{
            top: getPointPercent(tickTime, zoom, firstTickDate),
            opacity: fadeOut ? 0 : 1,
        }}>
            <div className={`timeline tick-label ${labelClassName}`}>
                {renderLabel ? renderLabel() : getTickLabel(tickTime, zoom, firstTickDate)}
            </div>
        </div>
    );
}

export default Tick;
