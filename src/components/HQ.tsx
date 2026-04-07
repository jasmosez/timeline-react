import { useEffect, useMemo, useState } from 'react'
import { LOCALE } from '../config'
import { SCALE_LEVEL_CONFIG, scaleLevelMax, scaleLevelMin } from '../timeline/scales'
import type { LeadingCalendarSystemId, TimelineLayer, TimelineLayerId } from '../timeline/layers'
import type { ViewportRangeStrategy } from '../viewport'
import { FULL_DATE_FORMAT } from '../utils'

interface TimelineLocationSettings {
  city: string
  region: string
  postalCode: string
  latitude: number
  longitude: number
}

interface HQProps {
  scaleLevel: keyof typeof SCALE_LEVEL_CONFIG
  rangeStrategy: ViewportRangeStrategy
  firstVisibleTickDate: Date
  handleZoom: (direction: '+' | '-') => void
  onResetTimeline: () => void
  lockNow: boolean
  onToggleLockNow: () => void
  isControlsPanelOpen: boolean
  onToggleControlsPanel: () => void
  birthDate: Date
  onBirthDateChange: (nextBirthDate: Date) => void
  timezone: string
  onTimezoneChange: (nextTimezone: string) => void
  location: TimelineLocationSettings
  onLocationChange: (nextLocation: TimelineLocationSettings) => void
  availableLayers: TimelineLayer[]
  activeLayerIds: TimelineLayerId[]
  leadingCalendarSystemId: LeadingCalendarSystemId
  onSetLeadingCalendarSystem: (layerId: LeadingCalendarSystemId) => void
  onToggleLayer: (layerId: TimelineLayerId) => void
  locationLabel: string
}

type ControlsTab = 'layers' | 'settings'

const isStructuralLayer = (
  layer: TimelineLayer,
): layer is TimelineLayer & { id: LeadingCalendarSystemId; role: 'structural' } =>
  layer.role === 'structural'

const formatDateTimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const formatDebugDate = (date: Date, scaleLevel: keyof typeof SCALE_LEVEL_CONFIG) =>
  date.toLocaleString(
    LOCALE,
    scaleLevel === -1 ? { ...FULL_DATE_FORMAT, second: '2-digit' } : FULL_DATE_FORMAT,
  )

const DEV_MODE = import.meta.env.DEV

export default function HQ({
  scaleLevel,
  rangeStrategy,
  firstVisibleTickDate,
  handleZoom,
  onResetTimeline,
  lockNow,
  onToggleLockNow,
  isControlsPanelOpen,
  onToggleControlsPanel,
  birthDate,
  onBirthDateChange,
  timezone,
  onTimezoneChange,
  location,
  onLocationChange,
  availableLayers,
  activeLayerIds,
  leadingCalendarSystemId,
  onSetLeadingCalendarSystem,
  onToggleLayer,
  locationLabel,
}: HQProps) {
  const structuralLayers = useMemo(
    () => availableLayers.filter(isStructuralLayer),
    [availableLayers],
  )
  const [activeTab, setActiveTab] = useState<ControlsTab>('layers')
  const [birthDateInputValue, setBirthDateInputValue] = useState(formatDateTimeLocalValue(birthDate))
  const [timezoneInputValue, setTimezoneInputValue] = useState(timezone)
  const [locationDraft, setLocationDraft] = useState({
    city: location.city,
    region: location.region,
    postalCode: location.postalCode,
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  })

  useEffect(() => {
    setBirthDateInputValue(formatDateTimeLocalValue(birthDate))
  }, [birthDate])

  useEffect(() => {
    setTimezoneInputValue(timezone)
  }, [timezone])

  useEffect(() => {
    setLocationDraft({
      city: location.city,
      region: location.region,
      postalCode: location.postalCode,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    })
  }, [location])

  const handleApplySettings = () => {
    const nextBirthDate = new Date(birthDateInputValue)
    if (!Number.isNaN(nextBirthDate.getTime())) {
      onBirthDateChange(nextBirthDate)
    }

    onTimezoneChange(timezoneInputValue)

    const latitude = Number.parseFloat(locationDraft.latitude)
    const longitude = Number.parseFloat(locationDraft.longitude)

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      onLocationChange({
        city: locationDraft.city,
        region: locationDraft.region,
        postalCode: locationDraft.postalCode,
        latitude,
        longitude,
      })
    }
  }

  return (
    <>
      <div className='hq-primary-shell'>
        <div className='hq-scale-status' data-testid='scale-title'>
          {SCALE_LEVEL_CONFIG[scaleLevel].label}
        </div>
        <div className='hq-primary-controls'>
          <div className='hq-zoom-group'>
            <button aria-label='Zoom out' disabled={scaleLevel === scaleLevelMax} onClick={() => handleZoom('+')}>-</button>
            <button aria-label='Zoom in' disabled={scaleLevel === scaleLevelMin} onClick={() => handleZoom('-')}>+</button>
          </div>
          <button aria-label='Reset timeline' onClick={onResetTimeline} className='hq-primary-pill-button'>
            Reset
          </button>
          <button aria-label='Lock now' onClick={onToggleLockNow} className='hq-primary-pill-button hq-lock-toggle'>
            {lockNow ? 'Unlock' : 'Lock Now'}
          </button>
        </div>
        <div className='hq-primary-actions'>
          <button
            aria-label={isControlsPanelOpen ? 'Close controls' : 'Open controls'}
            className='hq-primary-pill-button hq-controls-toggle-button'
            onClick={onToggleControlsPanel}
          >
            {isControlsPanelOpen ? 'Close' : 'Controls'}
          </button>
        </div>
      </div>

      <div className={`hq-panel ${isControlsPanelOpen ? 'hq-panel-open' : 'hq-panel-closed'}`}>
        {activeTab === 'layers' ? (
          <div className='hq-panel-section'>
            <div className='hq-section-title'>Visible Layers</div>
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

            <div className='hq-section-title'>Leading Structure</div>
            <div className='hq-layer-list'>
              {structuralLayers.map((layer) => (
                <label key={`leading-${layer.id}`} className='hq-layer-option'>
                  <input
                    type='radio'
                    name='leading-structure'
                    checked={leadingCalendarSystemId === layer.id}
                    onChange={() => onSetLeadingCalendarSystem(layer.id)}
                    aria-label={`Leading structure ${layer.label}`}
                    data-testid={`leading-structure-${layer.id}`}
                  />
                  <span>{layer.label}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className='hq-panel-section'>
            <div className='hq-section-title'>Timeline Settings</div>
            <label className='hq-field'>
              <span>Birthday</span>
              <input
                type='datetime-local'
                value={birthDateInputValue}
                onChange={(event) => setBirthDateInputValue(event.target.value)}
              />
            </label>
            <label className='hq-field'>
              <span>Timezone</span>
              <input
                type='text'
                value={timezoneInputValue}
                onChange={(event) => setTimezoneInputValue(event.target.value)}
              />
            </label>
            <label className='hq-field'>
              <span>City</span>
              <input
                type='text'
                value={locationDraft.city}
                onChange={(event) => setLocationDraft((prev) => ({ ...prev, city: event.target.value }))}
              />
            </label>
            <label className='hq-field'>
              <span>Region</span>
              <input
                type='text'
                value={locationDraft.region}
                onChange={(event) => setLocationDraft((prev) => ({ ...prev, region: event.target.value }))}
              />
            </label>
            <label className='hq-field'>
              <span>Postal Code</span>
              <input
                type='text'
                value={locationDraft.postalCode}
                onChange={(event) => setLocationDraft((prev) => ({ ...prev, postalCode: event.target.value }))}
              />
            </label>
            <div className='hq-field-grid'>
              <label className='hq-field'>
                <span>Latitude</span>
                <input
                  type='number'
                  step='0.0001'
                  value={locationDraft.latitude}
                  onChange={(event) => setLocationDraft((prev) => ({ ...prev, latitude: event.target.value }))}
                />
              </label>
              <label className='hq-field'>
                <span>Longitude</span>
                <input
                  type='number'
                  step='0.0001'
                  value={locationDraft.longitude}
                  onChange={(event) => setLocationDraft((prev) => ({ ...prev, longitude: event.target.value }))}
                />
              </label>
            </div>
            <label className='hq-layer-option hq-lock-option'>
              <input
                type='checkbox'
                checked={lockNow}
                onChange={onToggleLockNow}
                aria-label='Lock now'
                data-testid='lock-now-toggle'
              />
              <span>Lock Now</span>
            </label>
            <div className='hq-settings-summary'>
              <div>{locationLabel}</div>
              <div>{timezone}</div>
            </div>
            <button className='hq-primary-pill-button' onClick={handleApplySettings}>
              Apply Settings
            </button>
          </div>
        )}

        <div className='hq-panel-tabs' role='tablist' aria-label='Expanded controls'>
          <button
            role='tab'
            aria-selected={activeTab === 'layers'}
            className={`hq-panel-tab ${activeTab === 'layers' ? 'hq-panel-tab-active' : ''}`}
            onClick={() => setActiveTab('layers')}
          >
            Layers
          </button>
          <button
            role='tab'
            aria-selected={activeTab === 'settings'}
            className={`hq-panel-tab ${activeTab === 'settings' ? 'hq-panel-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {DEV_MODE ? (
          <div className='hq-debug-panel'>
            <div className='hq-section-title'>Debug</div>
            <div className='hq-debug-line'>
              <span>First visible tick</span>
              <span data-testid='start-tick-value'>{formatDebugDate(firstVisibleTickDate, scaleLevel)}</span>
            </div>
            <div className='hq-debug-line'>
              <span>Navigation mode</span>
              <span data-testid='navigation-mode-value'>{rangeStrategy}</span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
