import { LOCALE } from '../config';
import { FULL_DATE_FORMAT } from '../utils';
import { formatHebrewPrimaryNowLabel } from '../timeline/hebrewTime';
import type { PrimaryCalendarSystemId, TimelineEnvironment } from '../timeline/layers';
import { SCALE_LEVEL_CONFIG } from '../timeline/scales';
import { positionTimelinePoint } from '../timeline/layout';
import { TickPoint } from './Tick';
import type { TimelinePoint } from '../timeline/types';

interface NowTickProps {
    now: Date;
    environment: TimelineEnvironment;
    primaryCalendarSystemId: PrimaryCalendarSystemId;
    scaleLevel: keyof typeof SCALE_LEVEL_CONFIG;
    focusTimeMs: number;
    visibleDurationMs: number;
    startTickDate: Date;
}

function NowTick({
    now,
    environment,
    primaryCalendarSystemId,
    scaleLevel,
    focusTimeMs,
    visibleDurationMs,
    startTickDate,
}: NowTickProps) {
    const point: TimelinePoint = {
        id: `now-${SCALE_LEVEL_CONFIG[scaleLevel].key}`,
        kind: 'marker',
        timeMs: now.getTime(),
        label: primaryCalendarSystemId === 'hebrew'
            ? formatHebrewPrimaryNowLabel(now, environment)
            : now.toLocaleString(LOCALE, {...FULL_DATE_FORMAT, second: '2-digit'}),
    };

    return (
        <TickPoint
            point={positionTimelinePoint(point, scaleLevel, focusTimeMs, visibleDurationMs, startTickDate, {
                className: 'now-tick',
                labelClassName: 'now-tick-label',
            })}
        />
    );
}

export default NowTick;
