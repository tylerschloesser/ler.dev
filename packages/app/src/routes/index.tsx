import {
  Link,
  createFileRoute,
  invariant,
} from '@tanstack/react-router'
import clsx from 'clsx'
import { Application, Graphics } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { Vec2 } from '../resume/vec2'

export const Route = createFileRoute('/')({
  component: Index,
})

interface Circle {
  g: Graphics
  p: Vec2
  v: Vec2
}

function Index() {
  const container = useRef<HTMLDivElement>(null)

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
      if (controller.signal.aborted) {
        return
      }
      invariant(container.current)
      container.current.appendChild(canvas)

      const viewport = new Vec2(
        app.canvas.width,
        app.canvas.height,
      )

      const circles: Circle[] = []

      const numCircles = Math.floor(
        Math.pow(viewport.x * viewport.y, 1 / 4),
      )

      for (let i = 0; i < numCircles; i++) {
        const g = new Graphics()
        app.stage.addChild(g)

        const x = Math.random() * viewport.x
        const y = Math.random() * viewport.y
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

        circles.push({ g, p, v })
      }

      let lastFrame = self.performance.now()
      const callback: FrameRequestCallback = () => {
        const now = self.performance.now()
        const dt = now - lastFrame
        lastFrame = now

        for (const circle of circles) {
          circle.p = circle.p.add(circle.v.mul(dt / 1000))
          circle.g.position.set(circle.p.x, circle.p.y)
        }

        handle = self.requestAnimationFrame(callback)
      }
      handle = self.requestAnimationFrame(callback)
    })
    return () => {
      controller.abort()
      self.cancelAnimationFrame(handle)
      promise.then(() => app.destroy())
      canvas.remove()
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={container}
        className="absolute inset-0 blur-sm"
      />
      <div className="relative">
        <div className="w-dvw h-dvh flex items-center justify-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-center">ty.ler.dev</h1>
            <Link
              to="/resume"
              className={clsx(
                'block border p-2 rounded min-w-40 text-center shadow',
                'hover:bg-black hover:text-white hover:border-black',
                'transition-colors',
              )}
            >
              Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
