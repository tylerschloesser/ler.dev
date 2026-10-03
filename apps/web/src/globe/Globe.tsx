import { geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo'
import type { MultiLineString } from 'geojson'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import landTopology from 'world-atlas/land-110m.json'
import { LOCATIONS, RACES, type LocationId } from '../data/races.ts'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'
import styles from './Globe.module.css'
import {
  dragRotation,
  easeInOutCubic,
  interpolateView,
  isVisible,
  normalizeLng,
  sameView,
  targetView,
  viewDuration,
  viewModeFor,
  type Rotation,
  type View,
  type ViewMode,
} from './geo.ts'

const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>
const land = feature(topology, topology.objects.land)
const graticule = geoGraticule10()

let statesPromise: Promise<MultiLineString> | null = null

/** Interior state borders only, so they never fight the 110m coastline. Lazy: ~115 KB. */
function loadStates() {
  statesPromise ??= import('us-atlas/states-10m.json').then(({ default: json }) => {
    const topo = json as unknown as Topology<{ states: GeometryCollection }>
    return mesh(topo, topo.objects.states, (a, b) => a !== b)
  })
  return statesPromise
}

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
const LABEL_OFFSET = 13

// View changes bypass React: this writes straight to the DOM. React owns
// only data-active and data-highlighted on markers.
function draw(svg: SVGSVGElement | null, projection: GeoProjection, view: View, states: MultiLineString | null) {
  if (!svg) return
  const { rotation } = view
  projection.rotate(rotation).scale(view.scale).translate(view.translate)
  const path = geoPath(projection)
  const layer = (name: string) => svg.querySelector(`[data-layer="${name}"]`)
  layer('sphere')?.setAttribute('d', path({ type: 'Sphere' }) ?? '')
  layer('graticule')?.setAttribute('d', path(graticule) ?? '')
  layer('land')?.setAttribute('d', path(land) ?? '')
  if (states) layer('states')?.setAttribute('d', path(states) ?? '')
  for (const el of svg.querySelectorAll<SVGGElement>('[data-location-id]')) {
    const { lat, lng } = LOCATIONS[el.dataset.locationId as LocationId]
    const visible = isVisible([lng, lat], rotation)
    const [x, y] = projection([lng, lat]) ?? [0, 0]
    el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`)
    el.setAttribute('visibility', visible ? 'visible' : 'hidden')
    el.dataset.visible = String(visible)
    // Labels near the right edge flip to the left of their marker.
    const label = el.querySelector('text')
    if (label) {
      const flip = x + LABEL_OFFSET + label.getComputedTextLength() > svg.clientWidth - 4
      label.setAttribute('x', String(flip ? -LABEL_OFFSET : LABEL_OFFSET))
      label.setAttribute('text-anchor', flip ? 'end' : 'start')
    }
  }
  svg.dataset.rotation = `${normalizeLng(rotation[0]).toFixed(1)},${rotation[1].toFixed(1)}`
}

function setAnimating(svg: SVGSVGElement | null, animating: boolean) {
  if (svg) svg.dataset.animating = String(animating)
}

function setMode(svg: SVGSVGElement | null, mode: ViewMode) {
  if (svg) svg.dataset.view = mode
}

export function Globe({ activeLocationId, activeShape, highlightedLocationId, onMarkerClick, onMarkerHover }: Props) {
  const reducedMotion = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [projection] = useState(() => geoOrthographic())
  const sizeRef = useRef({ w: 0, h: 0 })
  const viewRef = useRef<View>(targetView(null, 0, 0))
  const statesRef = useRef<MultiLineString | null>(null)
  const activeRef = useRef(activeLocationId)
  const frameRef = useRef(0)
  const dragRef = useRef<Drag | null>(null)
  const suppressClickRef = useRef(false)

  const redraw = () => draw(svgRef.current, projection, viewRef.current, statesRef.current)

  const cancelFrame = () => {
    cancelAnimationFrame(frameRef.current)
    setAnimating(svgRef.current, false)
  }

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    setAnimating(svg, false)
    setMode(svg, 'globe')
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect
      sizeRef.current = { w, h }
      // A running fly re-targets every frame; otherwise refit, but keep any dragged rotation.
      if (svg.dataset.animating === 'true') return
      const { scale, translate } = targetView(activeRef.current, w, h)
      viewRef.current = { rotation: viewRef.current.rotation, scale, translate }
      draw(svg, projection, viewRef.current, statesRef.current)
    })
    observer.observe(svg)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [projection])

  // State borders load the first time a US race is active.
  useEffect(() => {
    if (viewModeFor(activeLocationId) !== 'us' || statesRef.current) return
    let cancelled = false
    void loadStates().then((states) => {
      if (cancelled) return
      statesRef.current = states
      draw(svgRef.current, projection, viewRef.current, states)
    })
    return () => {
      cancelled = true
    }
  }, [activeLocationId, projection])

  // Fly to the active location.
  useEffect(() => {
    activeRef.current = activeLocationId
    const svg = svgRef.current
    if (!activeLocationId || !svg) return
    const goal = () => targetView(activeLocationId, sizeRef.current.w, sizeRef.current.h)
    const from = viewRef.current
    cancelAnimationFrame(frameRef.current)
    setMode(svg, viewModeFor(activeLocationId))
    if (reducedMotion || sameView(from, goal()) || from.scale === 0) {
      viewRef.current = goal()
      setAnimating(svg, false)
      draw(svg, projection, viewRef.current, statesRef.current)
      return
    }
    const duration = viewDuration(from, goal())
    const start = performance.now()
    setAnimating(svg, true)
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // The goal is recomputed each frame so a resize mid-flight lands correctly.
      viewRef.current = t < 1 ? interpolateView(from, goal())(easeInOutCubic(t)) : goal()
      draw(svg, projection, viewRef.current, statesRef.current)
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
      start: viewRef.current.rotation,
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
      if (drag.lockTilt && Math.abs(dy) > Math.abs(dx)) {
        // A vertical touch gesture is a page scroll, not a drag.
        dragRef.current = null
        return
      }
      drag.moved = true
      e.currentTarget.dataset.dragging = 'true'
      // Captured lazily so that a plain tap still clicks the marker under it.
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    viewRef.current = { ...viewRef.current, rotation: dragRotation(drag.start, dx, dy, viewRef.current.scale, drag.lockTilt) }
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
        <path data-layer="states" className={styles.states} />
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
                <text className={styles.label} x={LABEL_OFFSET} y={5}>
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
