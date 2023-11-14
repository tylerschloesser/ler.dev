import { curry } from 'lodash'
import { useEffect } from 'react'
import { Engine, InitFn } from '../common/engine/index.js'
import { render } from './render.js'
import { Input, handleInput, state } from './state.js'

const init: InitFn = () => {
  console.log(state)
}

export function Tetris() {
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    function listener(
      type: 'keydown' | 'keyup',
      ev: KeyboardEvent,
    ) {
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
    document.addEventListener(
      'keydown',
      curry(listener)('keydown'),
      {
        signal,
      },
    )
    document.addEventListener(
      'keyup',
      curry(listener)('keyup'),
      {
        signal,
      },
    )
    return () => {
      controller.abort()
    }
  }, [])
  return <Engine init={init} render={render} />
}
