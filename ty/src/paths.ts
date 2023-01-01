import { Blob } from './blob'
import { Cal } from './cal'
import { Games } from './games'
import { Menu } from './menu'
import { ThreeDemo } from './three-demo'

interface PathInfo {
  path: string
  Component: React.FunctionComponent
}

export const PATHS: PathInfo[] = [
  {
    path: 'dots',
    Component: ThreeDemo,
  },
  {
    path: 'menu',
    Component: Menu,
  },
  {
    path: 'games',
    Component: Games,
  },
  {
    path: 'cal',
    Component: Cal,
  },
  {
    path: 'blob',
    Component: Blob,
  },
]
