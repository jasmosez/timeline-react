import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

interface StickyContextPresentationOptions {
  viewportRef: RefObject<HTMLDivElement | null>
  isGregorianVisible: boolean
  isHebrewVisible: boolean
  leadingCalendarSystemId: 'gregorian' | 'hebrew'
  gregorianTopLabel?: string
  gregorianBottomLabel?: string
  hebrewTopLabel?: string
  hebrewBottomLabel?: string
}

export function useStickyContextPresentation({
  viewportRef,
  isGregorianVisible,
  isHebrewVisible,
  leadingCalendarSystemId,
  gregorianTopLabel,
  gregorianBottomLabel,
  hebrewTopLabel,
  hebrewBottomLabel,
}: StickyContextPresentationOptions) {
  const [contextFontScale, setContextFontScale] = useState(1)
  const contextLabelRefs = useRef<Array<HTMLDivElement | null>>([])
  const singleStructuralContextVisible =
    Number(isGregorianVisible) + Number(isHebrewVisible) <= 1

  const gregorianContextSideClass =
    singleStructuralContextVisible || leadingCalendarSystemId === 'gregorian'
      ? 'structural-context-label-leading'
      : 'structural-context-label-supporting'

  const hebrewContextSideClass =
    singleStructuralContextVisible || leadingCalendarSystemId === 'hebrew'
      ? 'structural-context-label-leading'
      : 'structural-context-label-supporting'

  useLayoutEffect(() => {
    const viewportElement = viewportRef.current
    const rootElement = document.getElementById('root')

    if (!viewportElement || !rootElement) {
      return
    }

    const contextElements = contextLabelRefs.current.filter(
      (element): element is HTMLDivElement => element !== null,
    )

    if (contextElements.length === 0) {
      if (contextFontScale !== 1) {
        setContextFontScale(1)
      }
      return
    }

    const rootStyle = getComputedStyle(rootElement)
    const axisX = Number.parseFloat(rootStyle.getPropertyValue('--timeline-axis-x')) || 0
    const leftGutter = Number.parseFloat(rootStyle.getPropertyValue('--timeline-left-gutter')) || 0
    const contextLaneGap = Number.parseFloat(rootStyle.getPropertyValue('--context-lane-gap')) || 0
    const horizontalPadding = 12
    const leftAvailableWidth = Math.max(leftGutter - contextLaneGap - horizontalPadding, 40)
    const rightAvailableWidth = Math.max(
      viewportElement.clientWidth - axisX - contextLaneGap - horizontalPadding,
      40,
    )
    const currentScale = contextFontScale || 1

    const nextScale = contextElements.reduce((smallestScale, element) => {
      const unscaledWidth = element.getBoundingClientRect().width / currentScale
      const availableWidth = element.classList.contains('structural-context-label-leading')
        ? leftAvailableWidth
        : rightAvailableWidth

      return Math.min(smallestScale, Math.min(1, availableWidth / unscaledWidth))
    }, 1)

    const boundedScale = Math.max(nextScale, 0.68)

    if (Math.abs(boundedScale - contextFontScale) > 0.01) {
      setContextFontScale(boundedScale)
    }
  }, [
    contextFontScale,
    viewportRef,
    gregorianTopLabel,
    gregorianBottomLabel,
    hebrewTopLabel,
    hebrewBottomLabel,
    leadingCalendarSystemId,
    isGregorianVisible,
    isHebrewVisible,
  ])

  return {
    contextLabelRefs,
    contextLabelStyle: {
      fontSize: `${0.88 * contextFontScale}rem`,
    },
    birthdayLabelLaneClass: singleStructuralContextVisible
      ? 'birthday-marker-label-secondary-lane'
      : 'birthday-marker-label-outer-lane',
    gregorianContextSideClass,
    hebrewContextSideClass,
    singleStructuralContextVisible,
  }
}
