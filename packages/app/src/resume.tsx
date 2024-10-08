import {
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createNoise3D } from 'simplex-noise'
import invariant from 'tiny-invariant'
import { Rect } from './rect'
import { Vec2 } from './vec2'

const noise2d = createNoise3D()

const DEBUG: boolean = false
const SHOW_ROTATING_SQUARE: boolean = false

export function Resume() {
  return (
    <>
      <Canvas />
      <div className="relative flex justify-center">
        <div className="flex-1 flex gap-4 p-4 max-w-4xl">
          <div>
            <h3 className="text-lg font-bold">
              Specialties
            </h3>
            <ol className="text-gray-300">
              <li>React</li>
              <li>Typescript</li>
              <li>CSS</li>
              <li>AWS</li>
            </ol>
          </div>
          <div className="flex flex-col font-thin">
            <h1 className="text-2xl">
              <strong>Tyler</strong> Schloesser
            </h1>
            <h2 className="text-xl">Frontend Engineer</h2>
          </div>
        </div>
      </div>
    </>
  )
}

function useSize(ref: RefObject<Element>): Vec2 | null {
  const [size, setSize] = useState<Vec2 | null>(null)
  useEffect(() => {
    invariant(ref.current)
    const ro = new ResizeObserver(
      ([{ contentRect: rect }]) => {
        setSize(new Vec2(rect.width, rect.height))
      },
    )
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
    }
  }, [])
  return size
}

function Canvas() {
  const ref = useRef<HTMLDivElement>(null)
  const size = useSize(ref)

  const [pointer, setPointer] = useState<Vec2 | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener(
      'pointermove',
      (ev) => {
        setPointer(new Vec2(ev.clientX, ev.clientY))
      },
      { signal },
    )

    document.addEventListener(
      'pointerenter',
      (ev) => {
        setPointer(new Vec2(ev.clientX, ev.clientY))
      },
      { signal },
    )

    document.addEventListener(
      'pointerleave',
      () => {
        setPointer(null)
      },
      { signal },
    )

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
    >
      {size && (
        <CanvasSvg container={size} pointer={pointer} />
      )}
    </div>
  )
}

function useSmooth(next: Vec2) {
  const target = useRef<Vec2>(next)
  const handle = useRef<number | null>(null)
  const [smooth, setSmooth] = useState(target.current)
  const last = useRef<number | null>(null)

  const callback = useRef(() => {
    const now = self.performance.now()
    const dt = last.current ? now - last.current : 0
    last.current = now
    setSmooth((current) => {
      const v = target.current.sub(current)
      const dist = v.len()
      if (dist < 1e-3) {
        return target.current
      }
      return current.add(v.mul(dist ** 0.5 * (dt / 1000)))
    })
  })

  useEffect(() => {
    if (!smooth.equals(next)) {
      target.current = next
      handle.current = self.requestAnimationFrame(
        callback.current,
      )
    } else {
      handle.current = null
      last.current = null
    }
  }, [smooth, next])

  return smooth
}

interface RotatingSquareProps {
  container: Vec2
  pointer: Vec2 | null
}

function RotatingSquare({
  container,
  pointer,
}: RotatingSquareProps) {
  const box = useMemo(() => {
    const size = new Vec2(
      Math.min(container.x, container.y) / 4,
      Math.min(container.x, container.y) / 4,
    )
    return new Rect(
      new Vec2(
        container.x / 2 - size.x / 2,
        container.y / 2 - size.y / 2,
      ),
      size,
    )
  }, [container])

  const center = useMemo(
    () => container.div(2),
    [container],
  )

  const v = useMemo(() => {
    if (!pointer) {
      return Vec2.ZERO
    }
    return pointer.sub(center).map((v) => {
      const dist = v.len()
      return v.mul(-1 / Math.pow(dist, 0.1))
    })
  }, [pointer, center])

  const translate = useSmooth(v)

  return (
    <>
      <g
        transform={`translate(${translate.x}, ${translate.y})`}
      >
        <CanvasRect rect={box} />
      </g>
      {DEBUG && (
        <g stroke="white" strokeWidth="2" opacity=".5">
          {v && (
            <line
              x1={center.x}
              y1={center.y}
              x2={center.x + v.x}
              y2={center.y + v.y}
            />
          )}
          {pointer && (
            <circle cx={pointer.x} cy={pointer.y} r="10" />
          )}
        </g>
      )}
    </>
  )
}

interface GridProps {
  container: Vec2
}

function Grid({ container }: GridProps) {
  const len = useMemo(
    () => Math.min(container.x, container.y) * 0.1,
    [container],
  )

  const points = useMemo(() => {
    const position = container.div(2)
    const points: Vec2[] = []
    for (
      let x = 0;
      x <= Math.ceil(container.x / 2 / len);
      x++
    ) {
      for (
        let y = 0;
        y <= Math.ceil(container.y / 2 / len);
        y++
      ) {
        points.push(
          position.add(new Vec2(x * len, y * len)),
        )
        points.push(
          position.add(new Vec2(-x * len, y * len)),
        )
        points.push(
          position.add(new Vec2(x * len, -y * len)),
        )
        points.push(
          position.add(new Vec2(-x * len, -y * len)),
        )
      }
    }
    return points
  }, [container])

  const [time, setTime] = useState(self.performance.now())
  useEffect(() => {
    function callback() {
      setTime(self.performance.now())
      handle = self.requestAnimationFrame(callback)
    }
    let handle = self.requestAnimationFrame(callback)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

  const z = time * 2 ** -13

  return (
    <g strokeWidth="1" fill="none">
      {points.map((point, i) => (
        <GridRect key={i} point={point} len={len} z={z} />
      ))}
    </g>
  )
}

interface GridRectProps {
  point: Vec2
  len: number
  z: number
}

function GridRect({ point, len, z }: GridRectProps) {
  const noise = noise2d(point.x, point.y, z)

  const opacity = Math.max(noise * 0.5, 0)
  const stroke =
    noise > 0 ? `hsl(${noise * 360}, 50%, 50%)` : undefined
  return (
    <rect
      opacity={opacity}
      stroke={stroke}
      x={point.x}
      y={point.y}
      width={len}
      height={len}
    />
  )
}

interface CanvasSvgProps {
  container: Vec2
  pointer: Vec2 | null
}

function CanvasSvg({ container, pointer }: CanvasSvgProps) {
  const viewBox = useMemo(
    () => `0 0 ${container.x} ${container.y}`,
    [container],
  )

  return (
    <svg viewBox={viewBox}>
      <Grid container={container} />
      {SHOW_ROTATING_SQUARE && (
        <RotatingSquare
          container={container}
          pointer={pointer}
        />
      )}
    </svg>
  )
}

interface CanvasRectProps {
  rect: Rect
}

function CanvasRect({ rect }: CanvasRectProps) {
  const rotate = useRotate()
  return (
    <rect
      className="pointer-events-auto"
      transform={`rotate(${rotate.toFixed(2)}, ${rect.position.x + rect.size.x / 2}, ${rect.position.y + rect.size.y / 2})`}
      x={rect.position.x}
      y={rect.position.y}
      width={rect.size.x}
      height={rect.size.y}
      fill={`hsla(${rotate.toFixed(2)}, 50%, 50%, 0.5)`}
    />
  )
}

function useRotate(): number {
  const [rotate, setRotate] = useState(0)

  useEffect(() => {
    let last = performance.now()
    let handle: number
    function callback() {
      const now = performance.now()
      const dt = now - last
      last = now

      setRotate(
        (prev) => (prev + ((dt / 1000) * 360) / 8) % 360,
      )

      handle = self.requestAnimationFrame(callback)
    }
    handle = self.requestAnimationFrame(callback)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

  return rotate
}
