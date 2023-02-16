import React, { useEffect, useState } from 'react'
import { EngineV2 } from '../engine-v2'

export function Jump() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!container) return
    const engine = new EngineV2({ container })
    return () => {
      engine.cleanup()
    }
  }, [container])
  return <div ref={setContainer} />
}
