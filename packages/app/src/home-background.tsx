import { invariant } from '@tanstack/react-router'
import clsx from 'clsx'
import { Application, BlurFilter, Graphics } from 'pixi.js'
import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Vec2 } from './vec2'

interface Circle {
  g: Graphics
  p: Vec2
  z: number
  v: Vec2
}

export default function HomeBackground() {
  const container = useRef<HTMLDivElement>(null)
  const { ready } = useBackground(container)
  return (
    <div
      ref={container}
      className={clsx(
        'absolute inset-0',
        'transition-opacity duration-1000 ease-out',
        ready ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

function useBackground(
  container: RefObject<HTMLDivElement>,
): { ready: boolean } {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const app = new Application()
    invariant(container.current)
    const promise = app.init({
      canvas,
      antialias: true,
      eventMode: 'none',
      backgroundAlpha: 0,
      resizeTo: container.current,
    })
    const controller = new AbortController()

    let handle: number

    promise.then(() => {
      const { signal } = controller
      if (signal.aborted) {
        return
      }
      invariant(container.current)
      container.current.appendChild(canvas)

      const blurFilter = new BlurFilter()
      app.stage.filters = [blurFilter]

      const viewport = new Vec2(
        app.canvas.width,
        app.canvas.height,
      )

      const circles = initCircles(viewport)
      for (const circle of circles) {
        app.stage.addChild(circle.g)
      }

      let pointer: Vec2 | null = null
      let smooth = Vec2.ZERO

      function handlePointer(ev: PointerEvent) {
        pointer = new Vec2(
          ev.clientX / viewport.x,
          ev.clientY / viewport.y,
        ).sub(new Vec2(0.5, 0.5))
      }

      document.addEventListener(
        'pointermove',
        handlePointer,
        { signal },
      )
      document.addEventListener(
        'pointerdown',
        handlePointer,
        { signal },
      )

      let lastFrame = self.performance.now()
      const callback: FrameRequestCallback = () => {
        const now = self.performance.now()
        const dt = Math.min(
          now - lastFrame,
          (1 / 30) * 1000,
        )
        lastFrame = now

        if (pointer && smooth !== pointer) {
          const d = pointer.sub(smooth)
          const l = d.len()
          const s = Math.pow(1 + l * (dt / 1000), 1.5) - 1
          if (s > l || l < 0.001) {
            smooth = pointer
          } else {
            smooth = smooth.add(d.normalize().mul(s))
          }
        }

        const adjust = smooth
          ? smooth.mul(-1).mul(2)
          : Vec2.ZERO

        for (const circle of circles) {
          circle.p = circle.p.add(circle.v.mul(dt / 1000))
          const p = circle.p.add(adjust.mul(circle.z * 100))
          circle.g.position.set(p.x, p.y)
        }

        handle = self.requestAnimationFrame(callback)
      }
      handle = self.requestAnimationFrame(callback)

      setReady(true)
    })
    return () => {
      controller.abort()
      self.cancelAnimationFrame(handle)
      promise.then(() => app.destroy())
      canvas.remove()
    }
  }, [container])
  return { ready }
}

function initCircles(viewport: Vec2): Circle[] {
  const circles: Circle[] = []

  const numCircles =
    Math.floor(viewport.x * viewport.y) /
    (Math.PI * 100 ** 2)

  for (let i = 0; i < numCircles; i++) {
    const g = new Graphics()

    const x = Math.random() * viewport.x
    const y = Math.random() * viewport.y
    const z = Math.random()
    const r = 50 + Math.random() * 50

    g.circle(x, y, r)
    const h = 120
    const s = 50
    const l = Math.floor(25 + Math.random() * 50)
    g.fill(`hsl(${h}, ${s}%, ${l}%)`)

    const p = new Vec2(0, 0)
    const speed = 5 + Math.random() * 5
    const v = new Vec2(1, 0)
      .rotate(Math.random() * Math.PI * 2)
      .mul(speed)

    circles.push({ g, p, z, v })
  }

  circles.sort((a, b) => a.z - b.z)

  return circles
}
