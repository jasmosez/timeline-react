import { LOCALE } from '../config';
import { FULL_DATE_FORMAT } from '../utils';
import { SCALE_CONFIG } from '../timeline/scales';
import { positionTimelinePoint } from '../timeline/layout';
import { TickPoint } from './Tick';
import type { TimelinePoint } from '../timeline/types';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof SCALE_CONFIG;
    focusTimeMs: number;
    startTickDate: Date;
}

function NowTick({now, zoom, focusTimeMs, startTickDate}: NowTickProps) {
    const point: TimelinePoint = {
        id: `now-${now.getTime()}`,
        kind: 'marker',
        timeMs: now.getTime(),
        label: now.toLocaleString(LOCALE, {...FULL_DATE_FORMAT, second: '2-digit'}),
    };

    return (
        <TickPoint
            point={positionTimelinePoint(point, zoom, focusTimeMs, startTickDate, {
                className: 'now-tick',
                labelClassName: 'now-tick-label',
            })}
        />
    );
}

export default NowTick;
