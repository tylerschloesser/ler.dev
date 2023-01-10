import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Engine, InitFn } from '../common/engine'
import { render } from './render'
import { handleInput, Input, state } from './state'

const init: InitFn = () => {
  console.log(state)
}

const Container = styled.div`
  height: 100vh;
`

export function Tetris() {
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener(
      'keydown',
      (ev) => {
        const input = {
          ArrowRight: Input.MoveRight,
          ArrowLeft: Input.MoveLeft,
        }[ev.key]
        input && handleInput(input)
      },
      { signal },
    )
    return () => {
      controller.abort()
    }
  }, [])
  return (
    <Container>
      <Engine init={init} render={render} />
    </Container>
  )
}
