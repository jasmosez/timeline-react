import { ZOOM, getPointPercent, getTickLabel } from '../utils';

interface TickProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    className?: string;
    labelClassName?: string;
    renderLabel?: () => string;
}

function Tick({ tickTime, zoom, firstTickDate, className = '', labelClassName = '', renderLabel }: TickProps) {
    return (
        <div className={`timeline tick ${className}`} style={{
            top: getPointPercent(tickTime, zoom, firstTickDate),
        }}>
            <div className={`timeline tick-label ${labelClassName}`}>
                {renderLabel ? renderLabel() : getTickLabel(tickTime, zoom, firstTickDate)}
            </div>
        </div>
    );
}

export default Tick;
