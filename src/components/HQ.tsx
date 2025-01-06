import { LOCALE } from '../config';
import { ZOOM, zoomMax, zoomMin, FULL_DATE_FORMAT } from '../utils';


interface HQProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    firstTickDate: Date;
    handleZoom: (direction: '+' | '-') => void;
    handlePan: (direction: '+' | '-' | 'reset') => void;
}

export default function HQ({now, zoom, firstTickDate, handleZoom, handlePan}: HQProps) {
  return (
      <div style={{
          position: 'fixed',
          top: '25px',
          left: '25px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '5px',
        }}>
          <div style={{ fontWeight: 'bold' }}>{ZOOM[zoom].label} View</div>
          <div>Starting at {firstTickDate.toLocaleString(LOCALE, FULL_DATE_FORMAT)}</div>
          <div className='now'>Currently, {now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '20px'}}>
            <div style={{ border: '1px solid black', padding: '5px', borderRadius: '5px' }}>
              <div>Zoom</div>

              {/* TODO: see comment on handlezoom definition */}
              <button disabled={zoom === zoomMax} onClick={() => handleZoom('+')}>-</button>
              <button disabled={zoom === zoomMin} onClick={() => handleZoom('-')}>+</button>
              
            </div>
            <div style={{border: '1px solid black', padding: '5px', borderRadius: '5px' }}>
              <div>Pan</div>

              {/* TODO: see comment on handlezoom definition */}
              <button onClick={() => handlePan('-')}>-</button>
              <button onClick={() => handlePan('+')}>+</button>
              <button onClick={() => handlePan('reset')}>{'<>'}</button>
              
            </div>
          </div>
          <div style={{ padding: '5px', textAlign: 'left', fontSize: '.75rem' }}>
            <div>Viewing one {ZOOM[zoom].key}</div>
            <div>Each tick is the start of a {ZOOM[zoom].unit}</div>
            <div>Each span between ticks represents one whole {ZOOM[zoom].unit}</div>
          </div>
      </div>
  )
}