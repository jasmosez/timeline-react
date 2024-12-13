import { ZOOM } from '../utils';

interface TimelineProps {
    zoom: keyof typeof ZOOM;
    firstTick: Date;
}

function Timeline({zoom, firstTick}: TimelineProps) {
    const theLine = (
        <div className='timeline line' style={
          {
            position: 'absolute',
            height: '100%',
            width: '1px',
            backgroundColor: 'black',
            left: '50%',
            top: '0',
          }
        } />
      )
    
      const visibleTicks = ZOOM[zoom].visibleTicks
      const ticks = []
      for (let i = 0; i < ZOOM[zoom].visibleTicks; i++) {
        const tickGapPercentage = 100/visibleTicks
        const halfGap = tickGapPercentage/2
        ticks.push(
          <div key={i} className='timeline tick' style={
            {
              position: 'absolute',
              height: '1px',
              width: '10px',
              backgroundColor: 'black',
              top: `${i * tickGapPercentage + halfGap}%`,
              transform: `translateX(-50%)`,
            }
          }>
            <div style={{
            position: 'absolute',
            left: '15px', // Adjust as needed
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
          }}>
                {new Date(ZOOM[zoom].incrementFunc(firstTick, i)).toLocaleString()}
            </div>
    
          </div>
        )
      }

      return (
        <>
          {theLine}
          {ticks}
        </>
      )

}

export default Timeline;