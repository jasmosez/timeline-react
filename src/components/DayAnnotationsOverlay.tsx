import { useEffect, useMemo, useRef, useState } from 'react'
import type { ScaleLevel } from '../timeline/scales'
import type { DayAnnotationMap, PositionedDayAnnotation } from '../timeline/personalAnnotations'

type EditableField = {
  dayOfLife: number
  field: 'plans' | 'journal'
}

interface DayAnnotationsOverlayProps {
  activeScaleLevel: ScaleLevel
  annotations: DayAnnotationMap
  positionedAnnotations: PositionedDayAnnotation[]
  onUpdateAnnotation: (
    dayOfLife: number,
    field: 'plans' | 'journal' | 'journaledOnDay',
    value: string | boolean,
  ) => void
}

const MONTH_PREVIEW_MAX_LENGTH = 80

const getPreviewText = (value: string, isMonthView: boolean) =>
  isMonthView && value.length > MONTH_PREVIEW_MAX_LENGTH
    ? `${value.slice(0, MONTH_PREVIEW_MAX_LENGTH).trimEnd()}…`
    : value

function AnnotationField({
  dayOfLife,
  field,
  value,
  className,
  isEditing,
  onStartEditing,
  onCommit,
  isMonthView,
}: {
  dayOfLife: number
  field: 'plans' | 'journal'
  value: string
  className: string
  isEditing: boolean
  onStartEditing: () => void
  onCommit: (value: string) => void
  isMonthView: boolean
}) {
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return
    }

    textareaRef.current.focus()
    textareaRef.current.selectionStart = textareaRef.current.value.length
    textareaRef.current.selectionEnd = textareaRef.current.value.length
  }, [isEditing])

  useEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return
    }

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [draft, isEditing])

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className={`day-annotation-field day-annotation-field-editing ${className}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onCommit(draft)}
      />
    )
  }

  const displayValue = getPreviewText(value, isMonthView)

  return (
    <div
      className={[
        'day-annotation-field',
        className,
        displayValue ? 'day-annotation-field-filled' : 'day-annotation-field-empty',
        isMonthView ? 'day-annotation-field-month' : 'day-annotation-field-week',
      ].join(' ')}
      onClick={onStartEditing}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onStartEditing()
        }
      }}
      data-testid={`annotation-${field}-${dayOfLife}`}
    >
      {displayValue || ''}
    </div>
  )
}

export default function DayAnnotationsOverlay({
  activeScaleLevel,
  annotations,
  positionedAnnotations,
  onUpdateAnnotation,
}: DayAnnotationsOverlayProps) {
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const isMonthView = activeScaleLevel === 3

  const sortedAnnotations = useMemo(
    () => [...positionedAnnotations].sort((a, b) => a.dayOfLife - b.dayOfLife),
    [positionedAnnotations],
  )

  return (
    <>
      <div
        className={`timeline day-annotation-headers ${isMonthView ? 'day-annotation-headers-month' : 'day-annotation-headers-week'}`}
        data-testid='day-annotation-headers'
      >
        <div className='day-annotation-header day-annotation-header-plans'>Plans</div>
        <div className='day-annotation-header day-annotation-header-journal'>Journal</div>
      </div>
      {sortedAnnotations.map((annotationRow) => {
        const annotation = annotations[String(annotationRow.dayOfLife)]

        return (
          <div
            key={annotationRow.dayOfLife}
            className={`timeline day-annotation-row ${isMonthView ? 'day-annotation-row-month' : 'day-annotation-row-week'}`}
            style={{
              top: annotationRow.top,
              height: annotationRow.height,
            }}
          >
            <button
              type='button'
              className={`day-annotation-day-of-life ${annotation?.journaledOnDay ? 'day-annotation-day-of-life-journaled' : ''}`}
              onClick={() => onUpdateAnnotation(annotationRow.dayOfLife, 'journaledOnDay', !(annotation?.journaledOnDay ?? false))}
              data-testid={`annotation-day-of-life-${annotationRow.dayOfLife}`}
            >
              Day {annotationRow.dayOfLife}
            </button>
            <div className='day-annotation-columns'>
              <AnnotationField
                dayOfLife={annotationRow.dayOfLife}
                field='plans'
                value={annotation?.plans ?? ''}
                className='day-annotation-plans'
                isEditing={editingField?.dayOfLife === annotationRow.dayOfLife && editingField.field === 'plans'}
                isMonthView={isMonthView}
                onStartEditing={() => setEditingField({ dayOfLife: annotationRow.dayOfLife, field: 'plans' })}
                onCommit={(value) => {
                  onUpdateAnnotation(annotationRow.dayOfLife, 'plans', value)
                  setEditingField(null)
                }}
              />
              <AnnotationField
                dayOfLife={annotationRow.dayOfLife}
                field='journal'
                value={annotation?.journal ?? ''}
                className='day-annotation-journal'
                isEditing={editingField?.dayOfLife === annotationRow.dayOfLife && editingField.field === 'journal'}
                isMonthView={isMonthView}
                onStartEditing={() => setEditingField({ dayOfLife: annotationRow.dayOfLife, field: 'journal' })}
                onCommit={(value) => {
                  onUpdateAnnotation(annotationRow.dayOfLife, 'journal', value)
                  setEditingField(null)
                }}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}
