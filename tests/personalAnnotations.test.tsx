// @vitest-environment jsdom

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import DayAnnotationsOverlay from '../src/components/DayAnnotationsOverlay'
import {
  DAY_ANNOTATIONS_STORAGE_KEY,
  getPositionedDayAnnotations,
  loadDayAnnotations,
  saveDayAnnotations,
  updateDayAnnotation,
  type DayAnnotationMap,
} from '../src/timeline/personalAnnotations'
import type { TimelineEnvironment } from '../src/timeline/layers'

const TEST_ENVIRONMENT: TimelineEnvironment = {
  now: new Date('2026-04-01T12:00:00-04:00'),
  birthDate: new Date('1982-04-19T02:25:00-05:00'),
  timezone: 'America/New_York',
  location: {
    city: 'Northampton',
    region: 'MA',
    postalCode: '01060',
    latitude: 42.3251,
    longitude: -72.6412,
  },
}

describe('personal annotations', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('loads and saves annotations in localStorage', () => {
    const annotations: DayAnnotationMap = {
      '16054': {
        dayOfLife: 16054,
        plans: 'Write',
        journal: 'Wrote',
        journaledOnDay: true,
      },
    }

    saveDayAnnotations(annotations)

    expect(window.localStorage.getItem(DAY_ANNOTATIONS_STORAGE_KEY)).toContain('16054')
    expect(loadDayAnnotations()).toEqual(annotations)
  })

  it('creates and deletes annotation records as fields change', () => {
    let annotations = updateDayAnnotation({}, 16054, 'plans', 'Plan the day')

    expect(annotations['16054']).toEqual({
      dayOfLife: 16054,
      plans: 'Plan the day',
      journal: '',
      journaledOnDay: false,
    })

    annotations = updateDayAnnotation(annotations, 16054, 'plans', '')

    expect(annotations).toEqual({})
  })

  it('positions day annotations only in week and month views', () => {
    const focusTimeMs = new Date('2026-04-01T12:00:00-04:00').getTime()

    expect(
      getPositionedDayAnnotations(1, focusTimeMs, 61 * 60 * 1000, TEST_ENVIRONMENT),
    ).toEqual([])

    const weekAnnotations = getPositionedDayAnnotations(
      2,
      focusTimeMs,
      8 * 24 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )

    expect(weekAnnotations.length).toBeGreaterThan(0)
    expect(weekAnnotations[0]?.dayOfLife).toBeGreaterThan(0)
    expect(weekAnnotations[0]?.top).toMatch(/%/)
    expect(weekAnnotations[0]?.height).toMatch(/%/)
  })
})

describe('DayAnnotationsOverlay', () => {
  it('renders headers and commits inline edits', () => {
    const onUpdateAnnotation = vi.fn()

    const { container } = render(
      <DayAnnotationsOverlay
        activeScaleLevel={2}
        annotations={{
          '16054': {
            dayOfLife: 16054,
            plans: 'Plan',
            journal: 'Journal',
            journaledOnDay: true,
          },
        }}
        positionedAnnotations={[
          {
            dayOfLife: 16054,
            top: '20%',
            height: '10%',
          },
        ]}
        onUpdateAnnotation={onUpdateAnnotation}
      />,
    )

    expect(screen.getByTestId('day-annotation-headers').textContent).toContain('Plans')
    expect(screen.getByTestId('day-annotation-headers').textContent).toContain('Journal')

    fireEvent.click(screen.getByTestId('annotation-plans-16054'))

    const textarea = container.querySelector('textarea')
    expect(textarea).not.toBeNull()

    if (!textarea) {
      throw new Error('Expected textarea to exist')
    }

    fireEvent.change(textarea, { target: { value: 'Updated plan' } })
    fireEvent.blur(textarea)

    expect(onUpdateAnnotation).toHaveBeenCalledWith(16054, 'plans', 'Updated plan')
  })
})
