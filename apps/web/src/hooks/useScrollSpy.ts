import { useEffect, type RefObject } from 'react'

export const MOBILE_QUERY = '(max-width: 47.99rem)'

// A thin band across the viewport; on mobile it sits just below the 40svh globe.
const DESKTOP_BAND = '-45% 0px -54% 0px'
const MOBILE_BAND = '-60% 0px -39% 0px'

/**
 * Reports the first `[data-race-id]` element inside `container` that crosses the
 * reading band. Nothing is reported while `lockedRef` is set, or when no element
 * is in the band, so the previous one stays active.
 */
export function useScrollSpy(
  container: RefObject<HTMLElement | null>,
  onActive: (id: string) => void,
  lockedRef: RefObject<boolean>,
) {
  useEffect(() => {
    const root = container.current
    if (!root) return
    const media = window.matchMedia(MOBILE_QUERY)
    const inBand = new Set<Element>()
    let observer: IntersectionObserver | undefined

    const build = () => {
      observer?.disconnect()
      inBand.clear()
      const targets = [...root.querySelectorAll<HTMLElement>('[data-race-id]')]
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) inBand.add(entry.target)
            else inBand.delete(entry.target)
          }
          if (lockedRef.current) return
          const first = targets.find((el) => inBand.has(el))
          if (first?.dataset.raceId) onActive(first.dataset.raceId)
        },
        { rootMargin: media.matches ? MOBILE_BAND : DESKTOP_BAND },
      )
      for (const el of targets) observer.observe(el)
    }

    build()
    media.addEventListener('change', build)
    return () => {
      media.removeEventListener('change', build)
      observer?.disconnect()
    }
  }, [container, onActive, lockedRef])
}
