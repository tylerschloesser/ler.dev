import { lazy } from 'react'
import { Ball1 } from './ball1'
import { Demo as BlobDemo } from './blob'
import { Cal } from './cal'
import { Conquest } from './conquest'
import { Draw } from './draw'
import { Fly } from './fly'
import { Jump } from './jump'
import { Demo as MenuDemo } from './menu'
import { Tetris } from './tetris'

interface PathInfo {
  path: string
  Component: React.FunctionComponent
}

export const PATHS: PathInfo[] = [
  {
    path: 'dots',
    Component: lazy(() => import('./three-demo')),
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
]
