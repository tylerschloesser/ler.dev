import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { EngineV2 } from '../engine-v2'
import { init } from './init'
import { render } from './render'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

export function Jump() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!container) return
    const engine = new EngineV2({ container, init, render })
    return () => {
      engine.controller.abort()
    }
  }, [container])
  return <Container ref={setContainer} />
}
