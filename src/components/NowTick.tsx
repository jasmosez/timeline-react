import { LOCALE } from '../config';
import { FULL_DATE_FORMAT, getPointPercent, ZOOM } from '../utils';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function NowTick({now, zoom, firstTickDate}: NowTickProps) {
    return (
        <div className='timeline tick now-tick' style={{ top: getPointPercent(now.getTime(), zoom, firstTickDate) }} >
            <div className='timeline tick-label now-tick-label'>
                {now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}
            </div>
        </div>
    )
}

export default NowTick;