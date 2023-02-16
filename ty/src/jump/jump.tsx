import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
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

    // TODO clean this up
    state.viewport = {
      w: canvas.width,
      h: canvas.height,
    }

    engine.start()

    return () => {
      engine.controller.abort()
    }
  }, [container])
  return <Container ref={setContainer} />
}
