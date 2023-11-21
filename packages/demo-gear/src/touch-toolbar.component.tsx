import {
  createContext,
  use,
  useEffect,
  useState,
} from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import {
  executeBuild,
  updateBuildPosition,
} from './build.js'
import { moveCamera } from './camera.js'
import { MAX_RADIUS, MIN_RADIUS } from './const.js'
import styles from './touch-toolbar.module.scss'
import { AppState, HandType } from './types.js'
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
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        navigate('add-gear')
      }}
    >
      Add Gear
    </button>
  )
}

function AddGearView() {
  const state = use(AppContext)
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
      <input readOnly value={radius} />
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
