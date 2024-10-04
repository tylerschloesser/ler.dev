import { useEffect, useMemo, useRef, useState } from 'react'
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

function Canvas() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Vec2 | null>(null)
  useEffect(() => {
    invariant(ref.current)
    const rect = ref.current.getBoundingClientRect()
    setSize(new Vec2(rect.width, rect.height))
  }, [])
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none"
    >
      {size && <CanvasSvg container={size} />}
    </div>
  )
}

interface CanvasSvgProps {
  container: Vec2
}

function CanvasSvg({ container }: CanvasSvgProps) {
  const viewBox = useMemo(
    () => `0 0 ${container.x} ${container.y}`,
    [container],
  )

  const [rotate, setRotate] = useState(0)

  const box = useMemo(() => {
    const size = Math.min(container.x, container.y) / 2
    return new Rect(
      new Vec2(
        container.x / 2 - size / 2,
        container.y / 2 - size / 2,
      ),
      new Vec2(size),
    )
  }, [container])

  useEffect(() => {
    let last = performance.now()
    let handle: number
    function callback() {
      const now = performance.now()
      const dt = now - last
      last = now

      setRotate(
        (prev) => (prev + ((dt / 1000) * 360) / 4) % 360,
      )

      handle = self.requestAnimationFrame(callback)
    }
    handle = self.requestAnimationFrame(callback)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

  const [hover, setHover] = useState(false)

  return (
    <svg viewBox={viewBox}>
      <rect
        className="pointer-events-auto"
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
        transform={`rotate(${rotate}, ${box.position.x + box.size.x / 2}, ${box.position.y + box.size.y / 2})`}
        x={box.position.x}
        y={box.position.y}
        width={box.size.x}
        height={box.size.y}
        fill={`hsla(${rotate % 360}, 50%, 50%, 0.5)`}
        strokeWidth="2"
        stroke={hover ? 'white' : undefined}
      />
    </svg>
  )
}
