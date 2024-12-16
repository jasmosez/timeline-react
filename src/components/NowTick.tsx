import { ZOOM } from '../utils';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTick: Date;
}

function NowTick({now, zoom, firstTick}: NowTickProps) {
    const {calculateTickTimeFunc, visibleTicks} = ZOOM[zoom]
    
    const screenStartTime = calculateTickTimeFunc(firstTick, -0.5)
    const screenEndTime = calculateTickTimeFunc(firstTick, visibleTicks - 0.5)

    const nowDiff = now.getTime() - screenStartTime
    const screenDiff = screenEndTime - screenStartTime
    const nowTickPosition = nowDiff / screenDiff * 100

    console.log({
        screenStartTime,
        screenStartDate: new Date(screenStartTime),
        screenEndTime,
        screenEndDate: new Date(screenEndTime),
        now,
        nowDiff,
        screenDiff,
        nowTickPosition
    })
    
    return (
        <div className='timeline tick now-tick' style={{ top: `${nowTickPosition}%` }} >
        <div className='timeline tick-label now-tick-label'>
            {now.toLocaleString()}
        </div>
        </div>
    )
}

export default NowTick;