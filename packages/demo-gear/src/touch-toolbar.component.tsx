import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import styles from './touch-toolbar.module.scss'
import { AppState, PointerMode } from './types.js'

export interface TouchToolbarProps {
  state: AppState
}

type View = 'main' | 'add-gear'
type SetViewFn = Dispatch<SetStateAction<View>>

export function TouchToolbar(props: TouchToolbarProps) {
  const [view, setView] = useState<View>('main')
  const Inner = view === 'main' ? MainView : AddGearView
  return (
    <div className={styles.container}>
      <Inner state={props.state} setView={setView} />
    </div>
  )
}

function MainView({
  setView,
}: {
  state: AppState
  setView: SetViewFn
}) {
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        setView('add-gear')
      }}
    >
      Add Gear
    </button>
  )
}

function AddGearView({
  state,
}: {
  state: AppState
  setView: SetViewFn
}) {
  useEffect(() => {
    state.accelerate = null
    state.build = {
      chain: null,
      connections: [],
      position: null,
      radius: 1,
      valid: false,
    }
    state.pointer.mode = PointerMode.Build

    return () => {
      state.build = null
      state.pointer.mode === PointerMode.Free
    }
  }, [state])

  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        console.log('todo')
      }}
    >
      TODO
    </button>
  )
}
