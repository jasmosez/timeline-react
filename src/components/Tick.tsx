import { ZOOM, getPointPercent } from '../utils';

interface TickProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    index: number;
    className?: string;
    labelClassName?: string;
    renderLabel?: () => string;
}

function Tick({ tickTime, zoom, firstTickDate, index, className = '', labelClassName = '', renderLabel }: TickProps) {
    return (
        <div className={`timeline tick ${className}`} style={{
            top: getPointPercent(tickTime, zoom, firstTickDate),
        }}>
            <div className={`timeline tick-label ${labelClassName}`}>
                {renderLabel ? renderLabel() : ZOOM[zoom].renderTickLabel(tickTime, index === 0)}
            </div>
        </div>
    );
}

export default Tick;
