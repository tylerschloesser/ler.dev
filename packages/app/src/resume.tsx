import { useEffect, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

export function Resume() {
  return (
    <>
      <Canvas />
      <div className="flex justify-center">
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
      {size && <CanvasSvg size={size} />}
    </div>
  )
}

interface CanvasSvgProps {
  size: Vec2
}

function CanvasSvg({ size }: CanvasSvgProps) {
  const viewBox = useMemo(
    () => `0 0 ${size.x} ${size.y}`,
    [size],
  )
  return <svg viewBox={viewBox}></svg>
}
