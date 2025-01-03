
import { ZOOM, zoomMax, zoomMin } from '../utils';

interface HQProps {
    now: Date;
    zoom: keyof typeof ZOOM;
    handlezoom: (direction: '+' | '-') => void;
}

export default function HQ({now, zoom, handlezoom}: HQProps) {
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
          <div>
            <button disabled={zoom === zoomMin} onClick={() => handlezoom('-')}>-</button>
            <button disabled={zoom === zoomMax} onClick={() => handlezoom('+')}>+</button>
            <span style={{ fontWeight: 'bold' }}>{ZOOM[zoom].label}</span>
          </div>
          <div style={{ padding: '10px', textAlign: 'left' }}>
            <p>Viewing one {ZOOM[zoom].key}</p>
            <p>Each tick is the start of a {ZOOM[zoom].unit}</p>
            <p>Each span between ticks represents one whole {ZOOM[zoom].unit}</p>
            <p className='now'>Now: {now.toLocaleString()}</p>
          </div>
      </div>
  )
}