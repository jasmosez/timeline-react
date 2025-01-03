import { ZOOM, getPointPercent } from '../utils';

interface SpanProps {
    tickTime: number;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    visibleTicks: number;
}

function Span({ tickTime, zoom, firstTickDate, visibleTicks }: SpanProps) {
    return (
        <div 
            className='timeline span' 
            style={{
                top: `calc(${getPointPercent(tickTime, zoom, firstTickDate)} + 2px)`,
                width: '15px',
                height: `calc(${100 / visibleTicks}% - 4px)`,
                backgroundColor: 'pink',
                transform: 'translateX(-50%)',
            }}
            onClick={() => console.log('click', new Date(tickTime).toLocaleString())}
        />
    );
}

export default Span; 