import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { Vec2 } from './vec2'

async function init() {
  const canvas = document.createElement('canvas')
  const app = new PIXI.Application()
  const size = new Vec2(
    window.innerWidth,
    window.innerHeight,
  )
  await app.init({
    canvas,
    width: size.x,
    height: size.y,
    autoStart: false,
  })
  return { canvas, app }
}

type State = Awaited<ReturnType<typeof init>>

// @refresh reset
//
export function ResumeV2() {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State | null>(null)
  useEffect(() => {
    init().then((_state) => {
      const rect = new PIXI.Graphics()
      rect.rect(0, 0, 100, 100)
      rect.fill('red')
      rect.position.set(
        _state.canvas.width / 2,
        _state.canvas.height / 2,
      )
      rect.pivot.set(50, 50)

      _state.app.stage.addChild(rect)
      _state.app.start()

      _state.app.ticker.add((ticker) => {
        rect.rotation += ticker.deltaTime * 1e-2
      })

      setState(_state)
    })
  }, [])

  useEffect(() => {
    if (!state) {
      return
    }

    invariant(container.current)
    container.current.append(state.canvas)

    return () => {
      state.app.destroy(
        {
          removeView: true,
        },
        {
          children: true,
          context: true,
        },
      )
      if (container.current) {
        container.current.removeChild(state.canvas)
      } else {
        console.debug(`container is ${container.current}`)
      }
    }
  }, [state])

  return <div ref={container} />
}
