import React from 'react'
import styled from 'styled-components'
import { Engine, InitFn } from '../common/engine'
import { render } from './render'
import { state } from './state'

const init: InitFn = () => {
  console.log(state)
}

const Container = styled.div`
  height: 100vh;
`

export function Tetris() {
  return (
    <Container>
      <Engine init={init} render={render} />
    </Container>
  )
}
