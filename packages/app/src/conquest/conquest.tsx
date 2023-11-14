import { Engine } from '../common/engine/index.js'
import { init } from './init.js'
import { render } from './render.js'

export function Conquest() {
  return <Engine init={init} render={render} />
}
