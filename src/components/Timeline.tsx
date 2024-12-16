import { ZOOM } from '../utils';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function Timeline({zoom, firstTickDate}: TimelineProps) {
  const {calculateTickTimeFunc, screenSpan, visibleTicks} = ZOOM[zoom]

  const firstTickOffsetPecentage = (100/visibleTicks)/2
  const firstTickOffsetMs = screenSpan * firstTickOffsetPecentage/100
  const screenStartTime = calculateTickTimeFunc(firstTickDate, 0) - firstTickOffsetMs
  // console.log({firstTickOffsetPecentage, firstTickOffsetMs, screenStartTime, screenStartDate: new Date(screenStartTime)})

  
 
  const calculateTickTop = (tickTime: number) => {
    const timeSinceStart = tickTime - screenStartTime;
    const percentageOfScreenSpan = (timeSinceStart / screenSpan) * 100;
    // console.log({tickDate: new Date(tickTime), percentageOfScreenSpan})
    return `${percentageOfScreenSpan}%`;
  }

  const ticks = []
  for (let i = 0; i < visibleTicks; i++) {
    const tickTime = calculateTickTimeFunc(firstTickDate, i)
    ticks.push(
      <div key={i} className='timeline tick' style={{
          top: calculateTickTop(tickTime),
      }}>
        <div className='timeline tick-label'>
            {new Date(tickTime).toLocaleString()}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='timeline line' />
      {ticks}
    </>
  )

}

export default Timeline;