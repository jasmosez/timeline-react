import { useEffect, useState } from 'react'

import './App.css'
import './timelinePresentation.css'
import { getNow } from './utils'
import HQ from './components/HQ'
import Timeline from './components/Timeline'
import { DEFAULT_BIRTH_DATE } from './config'
import { gregorianLayer } from './timeline/gregorian'
import { hebrewLayer } from './timeline/hebrew'
import { birthdayLayer } from './timeline/birthday'
import { proportionalHoursLayer } from './timeline/proportionalHours'
import type { LeadingCalendarSystemId, TimelineEnvironment, TimelineLayerId } from './timeline/layers'
import { createInitialViewport, getViewportStartTickDate, type Viewport } from './viewport'
import { getContainingPeriodFocusTimeMs } from './timeline/periodAnchoring'
import {
  SCALE_LEVEL_CONFIG,
  getVisibleTimeRange,
  getFirstVisibleTickDate,
  getNearestScaleLevel,
  getScaleDurationBounds,
  getScaleLevelOrder,
  getScaleLevelVisibleDurationMs,
} from './timeline/scales'

const AVAILABLE_TIMELINE_LAYERS = [gregorianLayer, hebrewLayer, proportionalHoursLayer, birthdayLayer]
const LOCK_NOW_DEFAULT_PERCENT = 0.5
const DEFAULT_TIMELINE_LOCATION = {
  city: 'Northampton',
  region: 'MA',
  postalCode: '01060',
  latitude: 42.3251,
  longitude: -72.6412,
}
const DEFAULT_TIMELINE_TIMEZONE = 'America/New_York'
const COMPACT_LAYOUT_MEDIA_QUERY = '(max-width: 900px)'

const isValidTimezone = (value: string) => {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}

function App() {
  const [now, setNow] = useState(getNow)
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE)
  const [timelineTimezone, setTimelineTimezone] = useState(DEFAULT_TIMELINE_TIMEZONE)
  const [timelineLocation, setTimelineLocation] = useState(DEFAULT_TIMELINE_LOCATION)
  const [activeLayerIds, setActiveLayerIds] = useState<TimelineLayerId[]>(['gregorian'])
  const [leadingCalendarSystemId, setLeadingCalendarSystemId] = useState<LeadingCalendarSystemId>('gregorian')
  const [lockNow, setLockNow] = useState(false)
  const [lockNowAnchorPercent, setLockNowAnchorPercent] = useState<number | null>(null)
  const [viewport, setViewport] = useState<Viewport>(() => createInitialViewport(now, {
    birthDate: DEFAULT_BIRTH_DATE,
    timezone: DEFAULT_TIMELINE_TIMEZONE,
    location: DEFAULT_TIMELINE_LOCATION,
  }))
  const [isCompactLayout, setIsCompactLayout] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(COMPACT_LAYOUT_MEDIA_QUERY).matches : false,
  )
  const [controlsPreferenceSet, setControlsPreferenceSet] = useState(false)
  const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia(COMPACT_LAYOUT_MEDIA_QUERY).matches : true,
  )

  const activeScaleLevel = getNearestScaleLevel(viewport.visibleDurationMs)
  const startTickDate = getViewportStartTickDate(viewport)
  const firstVisibleTickDate = getFirstVisibleTickDate(
    activeScaleLevel,
    viewport.focusTimeMs,
    viewport.visibleDurationMs,
  )
  const activeLayers = AVAILABLE_TIMELINE_LAYERS.filter((layer) => activeLayerIds.includes(layer.id))
  const timelineEnvironment: TimelineEnvironment = {
    now,
    birthDate,
    timezone: timelineTimezone,
    location: timelineLocation,
  }
  const locationLabel = `${timelineEnvironment.location.city}, ${timelineEnvironment.location.region} ${timelineEnvironment.location.postalCode}`
  const scaleLevelOrder = getScaleLevelOrder()
  const { minVisibleDurationMs, maxVisibleDurationMs } = getScaleDurationBounds()
  const getNowPercent = (focusTimeMs: number, visibleDurationMs: number) => {
    const { startTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
    return (now.getTime() - startTimeMs) / visibleDurationMs
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_LAYOUT_MEDIA_QUERY)
    const applyLayoutMode = (matches: boolean) => {
      setIsCompactLayout(matches)
      if (!controlsPreferenceSet) {
        setIsControlsPanelOpen(!matches)
      }
    }

    applyLayoutMode(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      applyLayoutMode(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [controlsPreferenceSet])

  useEffect(() => {
    const updateIntervalMs = SCALE_LEVEL_CONFIG[activeScaleLevel].key === 'minute' ? 10 : 1000
    const currentNow = getNow()
    const timeUntilNextUpdate = updateIntervalMs - (currentNow.getTime() % updateIntervalMs || updateIntervalMs)

    let intervalId: number | undefined
    const timeoutId = window.setTimeout(() => {
      setNow(getNow())

      intervalId = window.setInterval(() => {
        setNow(getNow())
      }, updateIntervalMs)
    }, timeUntilNextUpdate)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [activeScaleLevel])

  useEffect(() => {
    if (viewport.rangeStrategy !== 'currentContainingPeriod') {
      return
    }

    setViewport((prevViewport) => {
      const nextFocusTimeMs = getContainingPeriodFocusTimeMs(
        leadingCalendarSystemId,
        getNearestScaleLevel(prevViewport.visibleDurationMs),
        now,
        timelineEnvironment,
      )

      if (nextFocusTimeMs === prevViewport.focusTimeMs) {
        return prevViewport
      }

      return {
        focusTimeMs: nextFocusTimeMs,
        visibleDurationMs: prevViewport.visibleDurationMs,
        rangeStrategy: prevViewport.rangeStrategy,
      }
    })
  }, [now, leadingCalendarSystemId, viewport.rangeStrategy])

  useEffect(() => {
    if (!lockNow) {
      if (lockNowAnchorPercent !== null) {
        setLockNowAnchorPercent(null)
      }
      return
    }

    const anchorPercent = lockNowAnchorPercent ?? LOCK_NOW_DEFAULT_PERCENT
    const nextFocusTimeMs = now.getTime() - (anchorPercent - 0.5) * viewport.visibleDurationMs
    if (nextFocusTimeMs !== viewport.focusTimeMs) {
      setViewport({
        focusTimeMs: nextFocusTimeMs,
        visibleDurationMs: viewport.visibleDurationMs,
        rangeStrategy: 'centered',
      })
    }
  }, [lockNow, lockNowAnchorPercent, now, viewport])

  const getZoomedViewport = (prevViewport: Viewport, nextVisibleDurationMs: number): Viewport => {
    if (prevViewport.rangeStrategy === 'currentContainingPeriod') {
      return {
        focusTimeMs: getContainingPeriodFocusTimeMs(
          leadingCalendarSystemId,
          getNearestScaleLevel(nextVisibleDurationMs),
          now,
          timelineEnvironment,
        ),
        visibleDurationMs: nextVisibleDurationMs,
        rangeStrategy: 'currentContainingPeriod',
      }
    }

    return {
      focusTimeMs: prevViewport.focusTimeMs,
      visibleDurationMs: nextVisibleDurationMs,
      rangeStrategy: 'centered',
    }
  }

  // Button zoom still walks the discrete scale bands one step at a time.
  const updateZoomByScaleSteps = (steps: number) => {
    if (steps === 0) {
      return
    }

    setViewport((prevViewport) => {
      const currentScaleLevel = getNearestScaleLevel(prevViewport.visibleDurationMs)
      const currentIndex = scaleLevelOrder.indexOf(currentScaleLevel)
      const nextIndex = Math.min(Math.max(currentIndex + steps, 0), scaleLevelOrder.length - 1)
      const nextScaleLevel = scaleLevelOrder[nextIndex]
      const nextVisibleDurationMs = getScaleLevelVisibleDurationMs(nextScaleLevel)

      if (nextVisibleDurationMs === prevViewport.visibleDurationMs) {
        return prevViewport
      }

      return getZoomedViewport(prevViewport, nextVisibleDurationMs)
    })
  }

  const handleZoom = (direction: '+' | '-') => {
    updateZoomByScaleSteps(direction === '+' ? 1 : -1)
  }

  const handleResetTimeline = () => {
    setViewport((prevViewport) => {
      return {
        focusTimeMs: getContainingPeriodFocusTimeMs(
          leadingCalendarSystemId,
          getNearestScaleLevel(prevViewport.visibleDurationMs),
          now,
          timelineEnvironment,
        ),
        visibleDurationMs: prevViewport.visibleDurationMs,
        rangeStrategy: 'currentContainingPeriod',
      }
    })
  }

  const handleToggleLayer = (layerId: TimelineLayerId) => {
    setActiveLayerIds((prevLayerIds) => {
      if (prevLayerIds.includes(layerId)) {
        return prevLayerIds.filter((id) => id !== layerId)
      }

      return [...prevLayerIds, layerId]
    })
  }

  const handleSetLeadingCalendarSystem = (layerId: LeadingCalendarSystemId) => {
    setLeadingCalendarSystemId(layerId)
    setActiveLayerIds((prevLayerIds) =>
      prevLayerIds.includes(layerId) ? prevLayerIds : [...prevLayerIds, layerId]
    )
  }

  const handleWheelPan = (deltaMs: number) => {
    if (deltaMs === 0) {
      return
    }

    setLockNow(false)
    setLockNowAnchorPercent(null)

    setViewport((prevViewport) => ({
      focusTimeMs: prevViewport.focusTimeMs + deltaMs,
      visibleDurationMs: prevViewport.visibleDurationMs,
      rangeStrategy: 'centered',
    }))
  }

  const handleWheelZoom = (zoomFactor: number, anchorPercent: number) => {
    if (zoomFactor === 1) {
      return
    }

    setViewport((prevViewport) => {
      const nextVisibleDurationMs = Math.min(
        Math.max(prevViewport.visibleDurationMs * zoomFactor, minVisibleDurationMs),
        maxVisibleDurationMs,
      )

      const clampedAnchorPercent = Math.min(Math.max(anchorPercent, 0), 1)
      const anchorTimeMs =
        prevViewport.focusTimeMs
        + (clampedAnchorPercent - 0.5) * prevViewport.visibleDurationMs
      const nextFocusTimeMs =
        anchorTimeMs + (0.5 - clampedAnchorPercent) * nextVisibleDurationMs

      return {
        focusTimeMs: nextFocusTimeMs,
        visibleDurationMs: nextVisibleDurationMs,
        rangeStrategy: 'centered',
      }
    })
  }

  const handleToggleLockNow = () => {
    if (lockNow) {
      setLockNow(false)
      setLockNowAnchorPercent(null)
      return
    }

    const nowPercent = getNowPercent(viewport.focusTimeMs, viewport.visibleDurationMs)
    const anchorPercent = nowPercent >= 0 && nowPercent <= 1
      ? nowPercent
      : LOCK_NOW_DEFAULT_PERCENT

    setLockNowAnchorPercent(anchorPercent)
    setLockNow(true)

    if (anchorPercent === LOCK_NOW_DEFAULT_PERCENT && (nowPercent < 0 || nowPercent > 1)) {
      setViewport({
        focusTimeMs: now.getTime(),
        visibleDurationMs: viewport.visibleDurationMs,
        rangeStrategy: 'centered',
      })
    }
  }

  const handleToggleControlsPanel = () => {
    setControlsPreferenceSet(true)
    setIsControlsPanelOpen((prev) => !prev)
  }

  const handleCloseControlsPanel = () => {
    setControlsPreferenceSet(true)
    setIsControlsPanelOpen(false)
  }

  const handleBirthDateChange = (nextBirthDate: Date) => {
    if (Number.isNaN(nextBirthDate.getTime())) {
      return
    }

    setBirthDate(nextBirthDate)
  }

  const handleTimezoneChange = (nextTimezone: string) => {
    if (!isValidTimezone(nextTimezone)) {
      return
    }

    setTimelineTimezone(nextTimezone)
  }

  const handleLocationChange = (nextLocation: typeof DEFAULT_TIMELINE_LOCATION) => {
    setTimelineLocation(nextLocation)
  }

  return (
    <div
      className={[
        'app-shell',
        isCompactLayout ? 'compact-layout' : 'desktop-layout',
        isControlsPanelOpen ? 'controls-open' : 'controls-closed',
      ].join(' ')}
    >
      <HQ
        scaleLevel={activeScaleLevel}
        rangeStrategy={viewport.rangeStrategy}
        firstVisibleTickDate={firstVisibleTickDate}
        handleZoom={handleZoom}
        onResetTimeline={handleResetTimeline}
        lockNow={lockNow}
        onToggleLockNow={handleToggleLockNow}
        isControlsPanelOpen={isControlsPanelOpen}
        onToggleControlsPanel={handleToggleControlsPanel}
        onCloseControlsPanel={handleCloseControlsPanel}
        birthDate={birthDate}
        onBirthDateChange={handleBirthDateChange}
        timezone={timelineTimezone}
        onTimezoneChange={handleTimezoneChange}
        location={timelineLocation}
        onLocationChange={handleLocationChange}
        availableLayers={AVAILABLE_TIMELINE_LAYERS}
        activeLayerIds={activeLayerIds}
        leadingCalendarSystemId={leadingCalendarSystemId}
        onSetLeadingCalendarSystem={handleSetLeadingCalendarSystem}
        onToggleLayer={handleToggleLayer}
        locationLabel={locationLabel}
      />
      <Timeline
        environment={timelineEnvironment}
        leadingCalendarSystemId={leadingCalendarSystemId}
        activeScaleLevel={activeScaleLevel}
        focusTimeMs={viewport.focusTimeMs}
        visibleDurationMs={viewport.visibleDurationMs}
        startTickDate={startTickDate}
        activeLayers={activeLayers}
        isGregorianVisible={activeLayerIds.includes('gregorian')}
        isHebrewVisible={activeLayerIds.includes('hebrew')}
        onPanTimeDelta={handleWheelPan}
        onZoomByFactor={handleWheelZoom}
      />
    </div>
  )
}

export default App
