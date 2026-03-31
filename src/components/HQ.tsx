
import { LOCALE, } from '../config';
import { FULL_DATE_FORMAT, dayNumber, sundayBasedWeekNumber } from '../utils';
import { SCALE_LEVEL_CONFIG, scaleLevelMax, scaleLevelMin } from '../timeline/scales';
import type { PrimaryCalendarSystemId, TimelineLayer, TimelineLayerId } from '../timeline/layers';
import type { ViewportRangeStrategy } from '../viewport';


interface HQProps {
    now: Date;
    scaleLevel: keyof typeof SCALE_LEVEL_CONFIG;
    rangeStrategy: ViewportRangeStrategy;
    firstVisibleTickDate: Date;
    handleZoom: (direction: '+' | '-') => void;
    handlePan: (direction: '+' | '-' | 'reset') => void;
    lockNow: boolean;
    onToggleLockNow: () => void;
    birthDate: Date;
    availableLayers: TimelineLayer[];
    activeLayerIds: TimelineLayerId[];
    primaryCalendarSystemId: PrimaryCalendarSystemId;
    onSetPrimaryCalendarSystem: (layerId: PrimaryCalendarSystemId) => void;
    onToggleLayer: (layerId: TimelineLayerId) => void;
    timezone: string;
    locationLabel: string;
}

const isStructuralLayer = (
  layer: TimelineLayer,
): layer is TimelineLayer & { id: PrimaryCalendarSystemId; role: 'structural' } =>
  layer.role === 'structural'

export default function HQ({
  now,
  scaleLevel,
  rangeStrategy,
  firstVisibleTickDate,
  handleZoom,
  handlePan,
  lockNow,
  onToggleLockNow,
  birthDate,
  availableLayers,
  activeLayerIds,
  primaryCalendarSystemId,
  onSetPrimaryCalendarSystem,
  onToggleLayer,
  timezone,
  locationLabel,
}: HQProps) {
  const structuralLayers = availableLayers.filter(isStructuralLayer)

  return (
      <div className='hq-container'>
          <div className='hq-title' data-testid='scale-title'>{SCALE_LEVEL_CONFIG[scaleLevel].label} View</div>
          <div className='hq-controls-container'>
            <div className='hq-controls'>
              <div className='hq-control'>
                <div>Zoom</div>

                <div className='hq-control-buttons'>
                  <button aria-label='Zoom out' disabled={scaleLevel === scaleLevelMax} onClick={() => handleZoom('+')}>-</button>
                  <button aria-label='Zoom in' disabled={scaleLevel === scaleLevelMin} onClick={() => handleZoom('-')}>+</button>
                </div>
                
              </div>
              <div className='hq-control'>
                <div>Pan</div>

                <div className='hq-control-buttons'>
                  <button aria-label='Pan backward' onClick={() => handlePan('-')}>-</button>
                  <button aria-label='Pan forward' onClick={() => handlePan('+')}>+</button>
                  <button aria-label='Reset timeline' onClick={() => handlePan('reset')}>{'<>'}</button>
                </div>
                
              </div>
            </div>
              <div className='hq-controls-info'>
              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Navigation</div>
              <label className='hq-layer-option'>
                <input
                  type='checkbox'
                  checked={lockNow}
                  onChange={onToggleLockNow}
                  aria-label='Lock now'
                  data-testid='lock-now-toggle'
                />
                <span>Lock Now</span>
              </label>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>First visible tick</div>
              <div data-testid='start-tick-value'>{firstVisibleTickDate.toLocaleString(LOCALE, scaleLevel === -1 ? {...FULL_DATE_FORMAT, ...{second: '2-digit'}} : FULL_DATE_FORMAT)}</div>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Navigation mode</div>
              <div data-testid='navigation-mode-value'>{rangeStrategy}</div>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Location</div>
              <div>{locationLabel}</div>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Timezone</div>
              <div>{timezone}</div>
              
              <div className='now' style={{fontWeight: 'bold', marginTop: '10px'}}>Currently</div>
              <div className='now'>{now.toLocaleString(LOCALE, FULL_DATE_FORMAT)}</div>
              
              <div className='now' style={{fontWeight: 'bold', marginTop: '10px'}}>1-indexed since {birthDate.toLocaleString(LOCALE, {month: 'long', day: 'numeric', year: 'numeric'})}</div>
              <div className='now'>Day {dayNumber(now, birthDate)}</div>
              <div className='now'>Week {sundayBasedWeekNumber(now, birthDate)}</div>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Layers</div>
              <div className='hq-layer-list'>
                {availableLayers.map((layer) => (
                  <label key={layer.id} className='hq-layer-option'>
                    <input
                      type='checkbox'
                      checked={activeLayerIds.includes(layer.id)}
                      onChange={() => onToggleLayer(layer.id)}
                    />
                    <span>{layer.label}</span>
                  </label>
                ))}
              </div>

              <div style={{fontWeight: 'bold', marginTop: '10px'}}>Primary Structure</div>
              <div className='hq-layer-list'>
                {structuralLayers.map((layer) => (
                  <label key={`primary-${layer.id}`} className='hq-layer-option'>
                    <input
                      type='radio'
                      name='primary-structure'
                      checked={primaryCalendarSystemId === layer.id}
                      onChange={() => onSetPrimaryCalendarSystem(layer.id)}
                      aria-label={`Primary structure ${layer.label}`}
                      data-testid={`primary-structure-${layer.id}`}
                    />
                    <span>{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
      </div>
  )
}
