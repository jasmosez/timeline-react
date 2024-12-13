
import { ZOOM, zoomMax, zoomMin } from './utils';

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
            gap: '10px',
          }}>
            <div>
              <button disabled={zoom === zoomMin} onClick={() => handlezoom('-')}>-</button>
              <button disabled={zoom === zoomMax} onClick={() => handlezoom('+')}>+</button>
            </div>
            <div style={{ padding: '10px', textAlign: 'left' }}>
              <p>Viewing one {ZOOM[zoom].label}</p>
              <p>Each tick represents {ZOOM[zoom].unit}</p>
              <p>{now.toLocaleString()}</p>
            </div>
        </div>
    )
}