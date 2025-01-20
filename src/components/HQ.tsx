
import { LOCALE, } from '../config';
import { ZOOM, zoomMax, zoomMin, FULL_DATE_FORMAT, dayNumber, birthdayBasedWeekNumber, sundayBasedWeekNumber } from '../utils';


interface HQProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    handleZoom: (direction: '+' | '-') => void;
    handlePan: (direction: '+' | '-' | 'reset') => void;
}



export default function HQ({now, zoom, firstTickDate, handleZoom, handlePan}: HQProps) {
  
  console.log(firstTickDate, dayNumber(firstTickDate), birthdayBasedWeekNumber(firstTickDate), sundayBasedWeekNumber(firstTickDate))

  return (
    // TODO: abstract styles to css file
      <div className='hq-container'>
          <div className='hq-title'>{ZOOM[zoom].label} View</div>
          <div className='hq-controls-container'>
            <div className='hq-controls'>
              <div className='hq-control'>
                <div>Zoom</div>

                {/* TODO: see comment on handlezoom definition */}
                <div className='hq-control-buttons'>
                  <button disabled={zoom === zoomMax} onClick={() => handleZoom('+')}>-</button>
                  <button disabled={zoom === zoomMin} onClick={() => handleZoom('-')}>+</button>
                </div>
                
              </div>
              <div className='hq-control'>
                <div>Pan</div>

                {/* TODO: see comment on handlezoom definition */}
                <div className='hq-control-buttons'>
                  <button onClick={() => handlePan('-')}>-</button>
                  <button onClick={() => handlePan('+')}>+</button>
                  <button onClick={() => handlePan('reset')}>{'<>'}</button>
                </div>
                
              </div>
            </div>
            <div className='hq-controls-info'>
              <div className='now' style={{fontWeight: 'bold', marginTop: '10px'}}>Currently</div>
              <div className='now'>{now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}</div>
              <div style={{fontWeight: 'bold', marginTop: '10px'}}>First tick</div>
              <div>{firstTickDate.toLocaleString(LOCALE, zoom === -1 ? {...FULL_DATE_FORMAT, ...{second: '2-digit'}} : FULL_DATE_FORMAT)}</div>
              {/* <div>Viewing one {ZOOM[zoom].key}</div> */}
              {/* <div>Each tick is the start of a {ZOOM[zoom].unit}</div> */}
              {/* <div>Each span between ticks represents one whole {ZOOM[zoom].unit}</div> */}
              
              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Birthday-based</div>
              <div>Day {dayNumber(firstTickDate)}</div>
              {/* <div>Birthday-based Week {birthdayBasedWeekNumber(firstTickDate)}</div> */}
              <div>Week {sundayBasedWeekNumber(firstTickDate)}</div>
            </div>
          </div>
      </div>
  )
}