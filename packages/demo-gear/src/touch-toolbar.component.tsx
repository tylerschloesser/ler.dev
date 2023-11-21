import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import { moveCamera } from './camera.js'
import styles from './touch-toolbar.module.scss'
import { AppState, HandType } from './types.js'

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
  setView,
}: {
  state: AppState
  setView: SetViewFn
}) {
  const [radius, setRadius] = useState(1)

  useEffect(() => {
    state.hand = {
      type: HandType.Build,
      position: null,
      chain: null,
      connections: [],
      radius,
      valid: false,
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    state.cameraListeners.add(() => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.Build)
      updateBuildPosition(state, hand, tileX, tileY)
    })

    return () => {
      state.hand = null
      state.cameraListeners.clear()
    }
  }, [state])

  return (
    <>
      <button
        className={styles.button}
        onPointerUp={() => {
          setView('main')
        }}
      >
        Cancel
      </button>
      <button className={styles.button}>&darr;</button>
      <input readOnly value={radius} />
      <button className={styles.button}>&uarr;</button>
      <button
        className={styles.button}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Build)
          executeBuild(state, hand)
        }}
      >
        Build
      </button>
    </>
  )
}
