import type { PositionedTimelinePoint } from '../timeline/types';

export function TickPoint({ point }: { point: PositionedTimelinePoint }) {
    return (
        <>
            <div className={`timeline tick ${point.className ?? ''}`} style={{
                top: point.top,
                opacity: point.opacity ?? 1,
            }} />
            {point.label ? (
                <div
                    className={`timeline tick-label ${point.labelClassName ?? ''}`}
                    style={{
                        top: point.top,
                        opacity: point.opacity ?? 1,
                    }}
                >
                    {point.label}
                </div>
            ) : null}
        </>
    );
}
