import { ZOOM } from '../utils';

interface TimelineProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTick: Date;
}

function Timeline({now, zoom, firstTick}: TimelineProps) {
  const {calculateTickTimeFunc, visibleTicks} = ZOOM[zoom]
  
  const calculateTickTop = (i: number) => {
    const tickGapPercentage = 100/visibleTicks
    const halfGap = tickGapPercentage/2
    return `${i * tickGapPercentage + halfGap}%`
  }

  const ticks = []
  for (let i = 0; i < visibleTicks; i++) {
    ticks.push(
      <div key={i} className='timeline tick' style={{
          top: calculateTickTop(i),
      }}>
        <div className='timeline tick-label'>
            {new Date(calculateTickTimeFunc(firstTick, i)).toLocaleString()}
        </div>
      </div>
    )
  }

  
  // determine where the now tick should be based on props.now, the time of the first tick and zoom scale. 
  // Note that the screen start and end are a half tick before and after the first and last tick, respectively
  const screenStartTime = calculateTickTimeFunc(firstTick, -0.5)
  const screenEndTime = calculateTickTimeFunc(firstTick, visibleTicks - 0.5)
  const nowDiff = now.getTime() - screenStartTime
  const screenDiff = screenEndTime - screenStartTime

  const nowTickPosition = nowDiff / screenDiff * 100
  
  
  const nowTick = (
    <div className='timeline tick now-tick' style={{ top: `${nowTickPosition}%` }} >
      <div className='timeline tick-label now-tick-label'>
        {now.toLocaleString()}
      </div>
    </div>
  )

  return (
    <>
      <div className='timeline line' />
      {ticks}
      {nowTick}
    </>
  )

}

export default Timeline;