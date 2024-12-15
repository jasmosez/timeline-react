import { ZOOM } from '../utils';

interface TimelineProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTick: Date;
}

function Timeline({now, zoom, firstTick}: TimelineProps) {
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
      const tickGapPercentage = 100/visibleTicks
      const halfGap = tickGapPercentage/2

      const ticks = []
      for (let i = 0; i < ZOOM[zoom].visibleTicks; i++) {
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

      
      // determine where the now tick should be based on props.now, the time of the first tick and zoom scale
      const nowDiff = now.getTime() - firstTick.getTime()
      const totalDiff = ZOOM[zoom].incrementFunc(firstTick, visibleTicks) - firstTick.getTime()
      const nowTickPosition = nowDiff / totalDiff * 100 + halfGap
      const nowTick = (
        <div className='timeline tick now-tick' style={
          {
            position: 'absolute',
            height: '1px',
            width: '10px',
            backgroundColor: 'red',
            top: `${nowTickPosition}%`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }
        } >
          <div style={{
            position: 'absolute',
            textAlign: 'right',
            right: '15px',
            transform: 'translateY(-35%)',
            whiteSpace: 'nowrap',
            color: 'red',
          }}>
            {now.toLocaleString()}
          </div>
        <div>

        </div>
        </div>
      )

      return (
        <>
          {theLine}
          {ticks}
          {nowTick}
        </>
      )

}

export default Timeline;