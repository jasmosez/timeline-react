import { ZOOM, getPointPercent } from '../utils';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
}

function Timeline({zoom, firstTickDate}: TimelineProps) {
  const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoom]

  const ticks = []
  for (let i = 0; i < visibleTicks; i++) {
    const tickTime = calculateTickTimeFunc(firstTickDate, i)
    ticks.push(
      <div key={i} className='timeline tick' style={{
          top: getPointPercent(tickTime, zoom, firstTickDate),
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