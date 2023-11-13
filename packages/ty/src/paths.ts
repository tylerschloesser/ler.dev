import { lazy } from 'react'
import { Ball1 } from './ball1/index.js'
import { Demo as BlobDemo } from './blob/index.js'
import { Cal } from './cal/index.js'
import { Conquest } from './conquest/index.js'
import { Draw } from './draw/index.js'
import { Fly } from './fly/index.js'
import { Jump } from './jump/index.js'
import { Demo as MenuDemo } from './menu/index.js'
import { TestCanvas } from './test-canvas/index.js'
import { Tetris } from './tetris/index.js'

interface PathInfo {
  path: string
  Component: React.FunctionComponent
}

export const PATHS: PathInfo[] = [
  {
    path: 'dots',
    Component: lazy(() =>
      import('./three-demo.js').then(({ ThreeDemo }) => ({
        default: ThreeDemo,
      })),
    ),
  },
  {
    path: 'menu',
    Component: MenuDemo,
  },
  {
    path: 'ball1',
    Component: Ball1,
  },
  {
    path: 'cal',
    Component: Cal,
  },
  {
    path: 'blob',
    Component: BlobDemo,
  },
  {
    path: 'tetris',
    Component: Tetris,
  },
  {
    path: 'fly',
    Component: Fly,
  },
  {
    path: 'draw',
    Component: Draw,
  },
  {
    path: 'conquest',
    Component: Conquest,
  },
  {
    path: 'jump',
    Component: Jump,
  },
  {
    path: 'test-canvas',
    Component: TestCanvas,
  },
  {
    path: 'gears',
    Component: lazy(() =>
      import('@ler.dev/demo-gear').then(({ DemoGear }) => ({
        default: DemoGear,
      })),
    ),
  },
]
