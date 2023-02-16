import React, { useEffect, useState } from 'react'
import { EngineV2 } from '../engine-v2'
import { init } from './init'
import { render } from './render'

export function Jump() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!container) return
    const engine = new EngineV2({ container, init, render })
    return () => {
      engine.controller.abort()
    }
  }, [container])
  return <div ref={setContainer} />
}
