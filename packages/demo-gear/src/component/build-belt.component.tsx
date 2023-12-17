import { use, useCallback, useEffect, useMemo } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { getBuildHand } from '../build-belt.js'
import { build } from '../build.js'
import { Axis, BuildHand, SimpleVec2 } from '../types.js'
import styles from './build-belt.module.scss'
import { AppContext } from './context.js'
import { Overlay } from './overlay.component.js'
import { useCameraTilePosition } from './use-camera-tile-position.js'
import { useWorldBuildVersion } from './use-world-build-version.js'

export function BuildBelt() {
  const context = use(AppContext)
  const navigate = useNavigate()
  const [startingAxis, setStartingAxis] = useStartingAxis()

  const cameraTilePosition = useCameraTilePosition()
  const [savedStart, setSavedStart] = useSavedStart()
  const end = !savedStart ? null : cameraTilePosition
  const start = savedStart ?? cameraTilePosition
  const hand = useHand(start, end, startingAxis)
  const { valid } = hand

  return (
    <Overlay>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      {savedStart && (
        <button
          className={styles.button}
          onPointerUp={() => {
            setSavedStart(null)
          }}
        >
          Cancel
        </button>
      )}
      <button
        className={styles.button}
        onPointerUp={() => {
          setStartingAxis(startingAxis === 'x' ? 'y' : 'x')
        }}
      >
        Rotate
      </button>
      {!savedStart && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!valid) return
            setSavedStart(cameraTilePosition)
          }}
        >
          Start
        </button>
      )}
      {savedStart && (
        <button
          disabled={!valid}
          className={styles.button}
          onPointerUp={() => {
            if (!valid) return
            build(context, hand)
            setSavedStart(null)
          }}
        >
          Build
        </button>
      )}
    </Overlay>
  )
}

function useHand(
  start: SimpleVec2,
  end: SimpleVec2 | null,
  startingAxis: Axis,
): BuildHand {
  const context = use(AppContext)
  const buildVersion = useWorldBuildVersion()

  const hand = useMemo<BuildHand>(
    () =>
      getBuildHand(context.world, start, end, startingAxis),
    [context, buildVersion, start, end, startingAxis],
  )

  useEffect(() => {
    context.hand = hand
    return () => {
      context.hand = null
    }
  }, [hand])

  return hand
}

function useSavedStart(): [
  SimpleVec2 | null,
  (start: SimpleVec2 | null) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const savedJson = searchParams.get('start')
  let saved: SimpleVec2 | null = null
  if (savedJson) {
    saved = SimpleVec2.parse(JSON.parse(savedJson))
  }

  const setStart = useCallback(
    (next: SimpleVec2 | null) => {
      setSearchParams((prev) => {
        if (next) {
          prev.set('start', JSON.stringify(next))
        } else {
          prev.delete('start')
        }
        return prev
      })
    },
    [setSearchParams],
  )

  return [saved, setStart]
}

function useStartingAxis(): [
  Axis,
  (startingAxis: Axis) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()

  const startingAxis = Axis.parse(
    searchParams.get('startingAxis') ?? 'x',
  )

  const setStartingAxis = useCallback(
    (next: Axis) => {
      setSearchParams(
        (prev) => {
          prev.set('startingAxis', next)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [startingAxis, setStartingAxis]
}
