import { curry } from 'lodash/fp'
import React, { useEffect } from 'react'
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

    function listener(type: 'keydown' | 'keyup', ev: KeyboardEvent) {
      if (type === 'keydown' && ev.key === ' ') {
        debugger
        return
      }

      const input = {
        ArrowRight: Input.MoveRight,
        ArrowLeft: Input.MoveLeft,
        ArrowDown: Input.MoveDown,
        ArrowUp: Input.Rotate,
      }[ev.key]
      input && handleInput(input, type)
    }

    // TODO arrayify this with typescript somehow
    document.addEventListener('keydown', curry(listener)('keydown'), {
      signal,
    })
    document.addEventListener('keyup', curry(listener)('keyup'), {
      signal,
    })
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
