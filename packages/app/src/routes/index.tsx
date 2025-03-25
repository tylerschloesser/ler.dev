import {
  Link,
  createFileRoute,
  invariant,
} from '@tanstack/react-router'
import clsx from 'clsx'
import { Application, Graphics } from 'pixi.js'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

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
    promise.then(() => {
      if (controller.signal.aborted) {
        return
      }
      invariant(container.current)
      container.current.appendChild(canvas)

      const g = new Graphics()
      app.stage.addChild(g)
      g.rect(0, 0, 100, 100)
      g.fill('blue')
    })
    return () => {
      controller.abort()
      promise.then(() => app.destroy())
      canvas.remove()
    }
  }, [])

  return (
    <div className="relative">
      <div ref={container} className="absolute inset-0" />
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
