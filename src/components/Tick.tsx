import type { PositionedTimelinePoint } from '../timeline/types';

export function TickPoint({ point }: { point: PositionedTimelinePoint }) {
    return (
        <div className={`timeline tick ${point.className ?? ''}`} style={{
            top: point.top,
            opacity: point.opacity ?? 1,
        }}>
            <div className={`timeline tick-label ${point.labelClassName ?? ''}`}>
                {point.label}
            </div>
        </div>
    );
}
