import { ZOOM } from '../utils';

interface NowTickProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function NowTick({now, zoom, firstTickDate}: NowTickProps) {
    const {calculateTickTimeFunc, screenSpan, visibleTicks} = ZOOM[zoom]
    
    // const screenStartTime = calculateTickTimeFunc(firstTickDate, -0.5)
    // const screenEndTime = calculateTickTimeFunc(firstTickDate, visibleTicks - 0.5)

    // const nowDiff = now.getTime() - screenStartTime
    // const screenDiff = screenEndTime - screenStartTime
    // const nowTickPosition = nowDiff / screenDiff * 100

    const firstTickOffsetPecentage = (100/visibleTicks)/2
    const firstTickOffsetMs = screenSpan * firstTickOffsetPecentage/100
    const screenStartTime = calculateTickTimeFunc(firstTickDate, 0) - firstTickOffsetMs
    
    const tickTime = now.getTime();
    const timeSinceStart = tickTime - screenStartTime;
    const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100;
    
    return (
        <div className='timeline tick now-tick' style={{ top: `${percentageOfScreenSpan}%` }} >
            <div className='timeline tick-label now-tick-label'>
                {now.toLocaleString()}
            </div>
        </div>
    )
}

export default NowTick;