import { useRef, useState } from 'react'
import { RACES, type LocationId, type Race } from '../data/races.ts'
import { Globe, type MarkerShape } from '../globe/Globe.tsx'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'
import { useScrollSpy } from '../hooks/useScrollSpy.ts'
import { RaceCard } from './RaceCard.tsx'
import styles from './RaceStory.module.css'

const shapeOf = (race: Race): MarkerShape =>
  race.outcome.status === 'dnf' ? 'ring' : race.distance === 'half-marathon' ? 'diamond' : 'dot'

// Safari has no scrollend.
const SCROLL_UNLOCK_FALLBACK_MS = 1000

export function RaceStory({ labelledBy }: { labelledBy: string }) {
  const reducedMotion = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const spyLockedRef = useRef(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  // Hover only highlights; it never rotates the globe.
  const [hoveredLocationId, setHoveredLocationId] = useState<LocationId | null>(null)

  useScrollSpy(listRef, setActiveId, spyLockedRef)

  const activeRace = RACES.find((r) => r.id === activeId)

  const onMarkerClick = (locationId: LocationId) => {
    const here = RACES.filter((r) => r.locationId === locationId)
    const current = here.findIndex((r) => r.id === activeId)
    const race = here[(current + 1) % here.length]
    setActiveId(race.id)

    const card = listRef.current?.querySelector<HTMLElement>(`[data-race-id="${race.id}"]`)
    if (!card) return
    // Keep the cards scrolling past from flying the globe along the way.
    spyLockedRef.current = true
    let timeout = 0
    const unlock = () => {
      spyLockedRef.current = false
      clearTimeout(timeout)
      window.removeEventListener('scrollend', unlock)
    }
    window.addEventListener('scrollend', unlock, { once: true })
    timeout = window.setTimeout(unlock, SCROLL_UNLOCK_FALLBACK_MS)
    card.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
    card.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }

  const onCardHover = (id: string | null) => {
    setHoveredLocationId(RACES.find((r) => r.id === id)?.locationId ?? null)
  }

  return (
    <section className={styles.story} aria-labelledby={labelledBy}>
      <div className={styles.globe}>
        <Globe
          activeLocationId={activeRace?.locationId ?? null}
          activeShape={activeRace ? shapeOf(activeRace) : 'dot'}
          highlightedLocationId={hoveredLocationId ?? activeRace?.locationId ?? null}
          onMarkerClick={onMarkerClick}
          onMarkerHover={setHoveredLocationId}
        />
      </div>
      <ol ref={listRef} className={styles.list} aria-label="Races">
        {RACES.map((race) => (
          <li key={race.id}>
            <RaceCard
              race={race}
              active={race.id === activeId}
              highlighted={race.locationId === hoveredLocationId}
              onHover={onCardHover}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
