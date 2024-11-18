import * as PIXI from 'pixi.js'
import { useMemo } from 'react'
import { Vec2 } from './vec2'

export function ResumeV2() {
  const size = useMemo(
    () => new Vec2(window.innerWidth, window.innerHeight),
    [],
  )

  return <canvas width={size.x} height={size.y} />
}
