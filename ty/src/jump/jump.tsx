import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Vec2 } from '../common/vec2'
import { EngineV2 } from '../engine-v2'
import { handlePointer } from './input'
import { render } from './render'
import { state } from './state'

const Container = styled.div`
  width: 100dvw;
  height: 100dvh;
`

export function Jump() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!container) return
    const engine = new EngineV2({ container, render })
    const signal = engine.controller.signal
    const { canvas } = engine

    canvas.addEventListener('pointerdown', handlePointer, { signal })
    canvas.addEventListener('pointermove', handlePointer, { signal })
    canvas.addEventListener('pointerup', handlePointer, { signal })
    canvas.addEventListener('pointerleave', handlePointer, { signal })

    // TODO clean this up
    state.viewport = {
      w: canvas.width,
      h: canvas.height,
    }

    state.camera = {
      p: new Vec2(0, -state.viewport.h),
      v: new Vec2(0, 0),
    }

    state.targets.push({
      p: new Vec2(state.viewport.w * 0.75, -state.viewport.h * 0.66),
      r: Math.min(state.viewport.w, state.viewport.h) * 0.05,
    })

    engine.start()

    return () => {
      engine.controller.abort()
    }
  }, [container])
  return <Container ref={setContainer} />
}
