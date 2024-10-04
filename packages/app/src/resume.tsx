import {
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import { Rect } from './rect'
import { Vec2 } from './vec2'

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

interface CanvasSvgProps {
  container: Vec2
  pointer: Vec2 | null
}

function CanvasSvg({ container, pointer }: CanvasSvgProps) {
  const viewBox = useMemo(
    () => `0 0 ${container.x} ${container.y}`,
    [container],
  )

  const box = useMemo(() => {
    const size = new Vec2(
      Math.min(container.x, container.y) / 8,
      Math.min(container.x, container.y) / 8,
    )
    return new Rect(
      new Vec2(
        container.x / 2 - size.x / 2,
        container.y / 2 - size.y / 2,
      ),
      size,
    )
  }, [container])

  return (
    <svg viewBox={viewBox}>
      <CanvasRect rect={box} />
      {pointer && (
        <circle
          cx={pointer.x}
          cy={pointer.y}
          fill="white"
          r="10"
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
        (prev) => (prev + ((dt / 1000) * 360) / 16) % 360,
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
