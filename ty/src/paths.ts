import { Ball1 } from './ball1'
import { Demo as BlobDemo } from './blob'
import { Cal } from './cal'
import { Demo as MenuDemo } from './menu'
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
]
