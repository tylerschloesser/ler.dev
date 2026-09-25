import { geoDistance, geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import landTopology from 'world-atlas/land-110m.json'
import { LOCATIONS, RACES, type LocationId } from '../data/races.ts'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'
import styles from './Globe.module.css'
import {
  DEFAULT_ROTATION,
  centerOf,
  dragRotation,
  easeInOutCubic,
  flyDuration,
  flyPath,
  isVisible,
  normalizeLng,
  rotationFor,
  type Rotation,
} from './geo.ts'

const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>
const land = feature(topology, topology.objects.land)
const graticule = geoGraticule10()

type Marker = { id: LocationId; city: string; dnfOnly: boolean }

const MARKERS: Marker[] = (Object.keys(LOCATIONS) as LocationId[]).map((id) => {
  const { city } = LOCATIONS[id]
  const races = RACES.filter((r) => r.locationId === id)
  return { id, city, dnfOnly: races.every((r) => r.outcome.status === 'dnf') }
})

export type MarkerShape = 'dot' | 'ring' | 'diamond'

type Props = {
  activeLocationId: LocationId | null
  activeShape: MarkerShape
  highlightedLocationId: LocationId | null
  onMarkerClick: (id: LocationId) => void
  onMarkerHover: (id: LocationId | null) => void
}

type Drag = { pointerId: number; x: number; y: number; start: Rotation; moved: boolean; lockTilt: boolean }

const DRAG_THRESHOLD = 4

// Rotation changes bypass React: this writes straight to the DOM. React owns
// only data-active and data-highlighted on markers.
function draw(svg: SVGSVGElement | null, projection: GeoProjection, rotation: Rotation) {
  if (!svg) return
  projection.rotate(rotation)
  const path = geoPath(projection)
  const layer = (name: string) => svg.querySelector(`[data-layer="${name}"]`)
  layer('sphere')?.setAttribute('d', path({ type: 'Sphere' }) ?? '')
  layer('graticule')?.setAttribute('d', path(graticule) ?? '')
  layer('land')?.setAttribute('d', path(land) ?? '')
  for (const el of svg.querySelectorAll<SVGGElement>('[data-location-id]')) {
    const { lat, lng } = LOCATIONS[el.dataset.locationId as LocationId]
    const visible = isVisible([lng, lat], rotation)
    const [x, y] = projection([lng, lat]) ?? [0, 0]
    el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`)
    el.setAttribute('visibility', visible ? 'visible' : 'hidden')
    el.dataset.visible = String(visible)
  }
  svg.dataset.rotation = `${normalizeLng(rotation[0]).toFixed(1)},${rotation[1].toFixed(1)}`
}

function setAnimating(svg: SVGSVGElement | null, animating: boolean) {
  if (svg) svg.dataset.animating = String(animating)
}

export function Globe({ activeLocationId, activeShape, highlightedLocationId, onMarkerClick, onMarkerHover }: Props) {
  const reducedMotion = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [projection] = useState(() => geoOrthographic().rotate(DEFAULT_ROTATION))
  const rotRef = useRef<Rotation>(DEFAULT_ROTATION)
  const frameRef = useRef(0)
  const dragRef = useRef<Drag | null>(null)
  const suppressClickRef = useRef(false)

  const redraw = () => draw(svgRef.current, projection, rotRef.current)

  const cancelFrame = () => {
    cancelAnimationFrame(frameRef.current)
    setAnimating(svgRef.current, false)
  }

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    setAnimating(svg, false)
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      projection.scale(Math.max(0, Math.min(width, height) / 2 - 8)).translate([width / 2, height / 2])
      draw(svg, projection, rotRef.current)
    })
    observer.observe(svg)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [projection])

  // Fly to the active location.
  useEffect(() => {
    const svg = svgRef.current
    if (!activeLocationId || !svg) return
    const { lat, lng } = LOCATIONS[activeLocationId]
    const target = rotationFor([lng, lat])
    const distance = geoDistance(centerOf(rotRef.current), centerOf(target))
    cancelAnimationFrame(frameRef.current)
    if (reducedMotion || distance < 1e-3) {
      rotRef.current = target
      setAnimating(svg, false)
      draw(svg, projection, target)
      return
    }
    const path = flyPath(rotRef.current, [lng, lat])
    const duration = flyDuration(distance)
    const start = performance.now()
    setAnimating(svg, true)
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      rotRef.current = t < 1 ? path(easeInOutCubic(t)) : target
      draw(svg, projection, rotRef.current)
      if (t < 1) frameRef.current = requestAnimationFrame(step)
      else setAnimating(svg, false)
    }
    frameRef.current = requestAnimationFrame(step)
  }, [activeLocationId, reducedMotion, projection])

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    cancelFrame()
    dragRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      start: rotRef.current,
      moved: false,
      // On touch, vertical swipes belong to the page (touch-action: pan-y).
      lockTilt: e.pointerType !== 'mouse',
    }
  }

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.moved) {
      if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return
      drag.moved = true
      e.currentTarget.dataset.dragging = 'true'
      // Captured lazily so that a plain tap still clicks the marker under it.
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    rotRef.current = dragRotation(drag.start, dx, dy, projection.scale(), drag.lockTilt)
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(redraw)
  }

  const endDrag = (e: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    delete e.currentTarget.dataset.dragging
    if (drag.moved) {
      suppressClickRef.current = true
      setTimeout(() => (suppressClickRef.current = false))
    }
  }

  const ordered = [...MARKERS].sort((a, b) => Number(a.id === activeLocationId) - Number(b.id === activeLocationId))

  return (
    <figure className={styles.figure}>
      <figcaption className="visually-hidden">Globe showing race locations; follows the race list</figcaption>
      <svg
        ref={svgRef}
        className={styles.svg}
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id="globe-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" className={styles.shadeLight} />
            <stop offset="100%" className={styles.shadeDark} />
          </radialGradient>
        </defs>
        <path data-layer="sphere" className={styles.sphere} />
        <path data-layer="graticule" className={styles.graticule} />
        <path data-layer="land" className={styles.land} />
        {ordered.map((marker) => {
          const active = marker.id === activeLocationId
          const shape: MarkerShape = active ? activeShape : marker.dnfOnly ? 'ring' : 'dot'
          const r = active ? 8 : 5
          return (
            <g
              key={marker.id}
              className={styles.marker}
              data-location-id={marker.id}
              data-shape={shape}
              data-active={active}
              data-highlighted={marker.id === highlightedLocationId}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') onMarkerHover(marker.id)
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') onMarkerHover(null)
              }}
              onClick={() => {
                if (!suppressClickRef.current) onMarkerClick(marker.id)
              }}
            >
              <circle className={styles.hit} r={14} />
              {shape === 'diamond' ? (
                <rect className={styles.dot} x={-r * 0.8} y={-r * 0.8} width={r * 1.6} height={r * 1.6} transform="rotate(45)" />
              ) : (
                <circle className={styles.dot} r={r} />
              )}
              {active && (
                <text className={styles.label} x={13} y={5}>
                  {marker.city}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
