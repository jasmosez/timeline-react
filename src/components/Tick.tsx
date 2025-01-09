import { ZOOM, getPointPercent, getTickLabel } from '../utils';

interface TickProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    className?: string;
    labelClassName?: string;
    renderLabel?: () => string;
    fadeOut?: boolean;
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
