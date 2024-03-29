import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { Vec2 } from '../common/vec2.js'
import { EngineV2 } from '../engine-v2/index.js'
import { handlePointer } from './input.js'
import { render } from './render.js'
import { state } from './state.js'
import { Target } from './types.js'

const Container = styled.div`
  width: 100dvw;
  height: 100dvh;
`

export function Jump() {
  const [container, setContainer] =
    useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!container) return
    const engine = new EngineV2({ container, render })
    const signal = engine.controller.signal
    const { canvas } = engine

    canvas.addEventListener('pointerdown', handlePointer, {
      signal,
    })
    canvas.addEventListener('pointermove', handlePointer, {
      signal,
    })
    canvas.addEventListener('pointerup', handlePointer, {
      signal,
    })
    canvas.addEventListener('pointerleave', handlePointer, {
      signal,
    })

    // TODO clean this up
    state.viewport = {
      w: canvas.width,
      h: canvas.height,
    }

    state.camera = {
      p: new Vec2(0, -state.viewport.h),
      v: new Vec2(0, 0),
    }

    let last: Target = {
      p: new Vec2(
        state.viewport.w * 0.75,
        -state.viewport.h * 0.66,
      ),
      r:
        Math.min(state.viewport.w, state.viewport.h) * 0.05,
    }
    state.targets.push(last)

    for (let i = 0; i < 20; i++) {
      let next = {
        p: new Vec2(
          last.p.x +
            (0.5 - Math.random()) * state.viewport.w,
          last.p.y + -state.viewport.h * 0.66,
        ),
        r: last.r,
      }
      state.targets.push(next)
      last = next
    }

    engine.start()

    return () => {
      engine.controller.abort()
    }
  }, [container])
  return <Container ref={setContainer} />
}
