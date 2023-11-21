import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { updateAcceleratePosition } from './accelerate.js'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import { moveCamera } from './camera.js'
import { MAX_RADIUS, MIN_RADIUS } from './const.js'
import styles from './touch-toolbar.module.scss'
import {
  AppState,
  Camera,
  CameraListenerFn,
  HandType,
} from './types.js'
import { useResetWorld, useSaveWorld } from './use-world.js'
import { clamp } from './util.js'

export interface TouchToolbarProps {
  state: AppState
}

const AppContext = createContext<AppState>(null!)

const router = createBrowserRouter([
  {
    path: '/',
    Component: MainView,
  },
  {
    path: '/add-gear',
    Component: AddGearView,
  },
  {
    path: '/accelerate',
    Component: AccelerateView,
  },
])

export function TouchToolbar(props: TouchToolbarProps) {
  return (
    <AppContext.Provider value={props.state}>
      <div className={styles.container}>
        <RouterProvider router={router} />
      </div>
    </AppContext.Provider>
  )
}

function MainView() {
  const navigate = useNavigate()
  const state = use(AppContext)
  const save = useSaveWorld(state.world)
  const reset = useResetWorld(state.setWorld)
  return (
    <>
      <button className={styles.button} onPointerUp={save}>
        Save
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          if (self.confirm('Are you sure?')) {
            reset()
          }
        }}
      >
        Reset
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('accelerate')
        }}
      >
        Accelerate
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('add-gear')
        }}
      >
        Add Gear
      </button>
    </>
  )
}

function AddGearView() {
  const state = use(AppContext)
  const [radius, setRadius] = useState(1)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    state.hand = {
      type: HandType.Build,
      position: null,
      chain: null,
      connections: [],
      radius,
      valid: false,
      onChangeValid: setValid,
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    const cameraListener: CameraListenerFn = () => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.Build)
      updateBuildPosition(state, hand, tileX, tileY)
    }
    cameraListener(state)
    state.cameraListeners.add(cameraListener)

    return () => {
      state.hand = null
      state.cameraListeners.clear()
    }
  }, [state])

  useEffect(() => {
    if (state.hand?.type === HandType.Build) {
      state.hand.radius = radius
    }
  }, [radius])

  const navigate = useNavigate()

  return (
    <>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('/')
        }}
      >
        Cancel
      </button>
      <button
        className={styles.button}
        disabled={radius === MIN_RADIUS}
        onPointerUp={() => {
          setRadius((prev) =>
            clamp(prev - 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &darr;
      </button>
      <input
        className={styles.input}
        readOnly
        value={radius}
      />
      <button
        className={styles.button}
        disabled={radius === MAX_RADIUS}
        onPointerUp={() => {
          setRadius((prev) =>
            clamp(prev + 1, MIN_RADIUS, MAX_RADIUS),
          )
        }}
      >
        &uarr;
      </button>
      <button
        className={styles.button}
        disabled={!valid}
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

function AccelerateView() {
  const navigate = useNavigate()
  const state = use(AppContext)

  const [disabled, setDisabled] = useState<boolean>(true)

  useEffect(() => {
    state.hand = {
      type: HandType.Accelerate,
      position: null,
      active: false,
      direction: 1,
      gear: null,
      onChangeGear(gear) {
        setDisabled(gear === null)
      },
    }
    state.pointerListeners.clear()
    state.pointerListeners.add(moveCamera)
    const cameraListener: CameraListenerFn = () => {
      const tileX = Math.round(state.camera.position.x)
      const tileY = Math.round(state.camera.position.y)
      const { hand } = state
      invariant(hand?.type === HandType.Accelerate)
      updateAcceleratePosition(state, hand, tileX, tileY)
    }
    cameraListener(state)
    state.cameraListeners.add(cameraListener)
    return () => {
      state.hand = null
      state.cameraListeners.clear()
    }
  }, [])

  return (
    <>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('/')
        }}
      >
        Back
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Accelerate)
          hand.active = true
          hand.direction = -1
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Accelerate)
          hand.active = false
        }}
      >
        -1
      </button>
      <button
        disabled={disabled}
        className={styles.button}
        onPointerDown={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Accelerate)
          hand.active = true
          hand.direction = 1
        }}
        onPointerUp={() => {
          const { hand } = state
          invariant(hand?.type === HandType.Accelerate)
          hand.active = false
        }}
      >
        +1
      </button>
    </>
  )
}
