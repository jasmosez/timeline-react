import { ZOOM, getPointPercent } from '../utils';

interface TickProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    index: number;
}

function Tick({ tickTime, zoom, firstTickDate, index }: TickProps) {
    return (
        <div className='timeline tick' style={{
            top: getPointPercent(tickTime, zoom, firstTickDate),
        }}>
            <div className='timeline tick-label'>
                {ZOOM[zoom].renderTickLabel(tickTime, index === 0)}
            </div>
        </div>
    );
}

export default Tick;
