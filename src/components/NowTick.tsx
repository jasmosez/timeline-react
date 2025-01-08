import { LOCALE } from '../config';
import { FULL_DATE_FORMAT, ZOOM } from '../utils';
import Tick from './Tick';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function NowTick({now, zoom, firstTickDate}: NowTickProps) {
    return (
        <Tick
            tickTime={now.getTime()}
            zoom={zoom}
            firstTickDate={firstTickDate}
            className="now-tick"
            labelClassName="now-tick-label"
            renderLabel={() => now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}
        />
    );
}

export default NowTick;