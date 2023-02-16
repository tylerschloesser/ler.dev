import React from 'react'
import { Engine } from '../common/engine'
import { init } from './init'
import { render } from './render'

export function Jump() {
  return <Engine render={render} init={init} />
}
