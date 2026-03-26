import { LOCALE } from '../config';
import { FULL_DATE_FORMAT } from '../utils';
import { ZOOM } from '../timeline/scales';
import { positionTimelinePoint } from '../timeline/layout';
import { TickPoint } from './Tick';
import type { TimelinePoint } from '../timeline/types';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function NowTick({now, zoom, firstTickDate}: NowTickProps) {
    const point: TimelinePoint = {
        id: `now-${now.getTime()}`,
        kind: 'marker',
        timeMs: now.getTime(),
        label: now.toLocaleString(LOCALE, {...FULL_DATE_FORMAT, second: '2-digit'}),
    };

    return (
        <TickPoint
            point={positionTimelinePoint(point, zoom, firstTickDate, {
                className: 'now-tick',
                labelClassName: 'now-tick-label',
            })}
        />
    );
}

export default NowTick;
