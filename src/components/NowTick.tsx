import { LOCALE } from '../config';
import { FULL_DATE_FORMAT } from '../utils';
import { ZOOM, getPointPercent } from '../timeline/scales';
import { TickPoint } from './Tick';
import type { PositionedTimelinePoint } from '../timeline/types';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function NowTick({now, zoom, firstTickDate}: NowTickProps) {
    const point: PositionedTimelinePoint = {
        id: `now-${now.getTime()}`,
        kind: 'marker',
        timeMs: now.getTime(),
        top: getPointPercent(now.getTime(), zoom, firstTickDate),
        className: 'now-tick',
        labelClassName: 'now-tick-label',
        label: now.toLocaleString(LOCALE, {...FULL_DATE_FORMAT, second: '2-digit'}),
    };

    return (
        <TickPoint point={point} />
    );
}

export default NowTick;
