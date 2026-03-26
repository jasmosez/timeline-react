
import { LOCALE, } from '../config';
import { FULL_DATE_FORMAT, dayNumber, sundayBasedWeekNumber } from '../utils';
import { SCALE_CONFIG, zoomMax, zoomMin } from '../timeline/scales';


interface HQProps {
    now: Date;
    zoom: keyof typeof SCALE_CONFIG;
    firstTickDate: Date;
    handleZoom: (direction: '+' | '-') => void;
    handlePan: (direction: '+' | '-' | 'reset') => void;
    birthDate: Date;
}



export default function HQ({now, zoom, firstTickDate, handleZoom, handlePan, birthDate}: HQProps) {
  return (
    // TODO: abstract styles to css file
      <div className='hq-container'>
          <div className='hq-title'>{SCALE_CONFIG[zoom].label} View</div>
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
              <div style={{fontWeight: 'bold', marginTop: '10px'}}>First tick</div>
              <div>{firstTickDate.toLocaleString(LOCALE, zoom === -1 ? {...FULL_DATE_FORMAT, ...{second: '2-digit'}} : FULL_DATE_FORMAT)}</div>
              
              <div className='now' style={{fontWeight: 'bold', marginTop: '10px'}}>Currently</div>
              <div className='now'>{now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}</div>
              
              <div className='now' style={{fontWeight: 'bold', marginTop: '10px'}}>1-indexed since {birthDate.toLocaleString(LOCALE, {month: 'long', day: 'numeric', year: 'numeric'})}</div>
              <div className='now'>Day {dayNumber(now, birthDate)}</div>
              <div className='now'>Week {sundayBasedWeekNumber(now, birthDate)}</div>
              {/* <div>Viewing one {SCALE_CONFIG[zoom].key}</div> */}
              {/* <div>Each tick is the start of a {SCALE_CONFIG[zoom].unit}</div> */}
              {/* <div>Each span between ticks represents one whole {SCALE_CONFIG[zoom].unit}</div> */}
              
              {/* <div>Birthday-based Week {birthdayBasedWeekNumber(firstTickDate)}</div> */}
            </div>
          </div>
      </div>
  )
}
