import { ZOOM } from '../utils';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTick: Date;
}

function Timeline({zoom, firstTick}: TimelineProps) {
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

  return (
    <>
      <div className='timeline line' />
      {ticks}
    </>
  )

}

export default Timeline;