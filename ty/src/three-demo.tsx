import { Canvas, useFrame } from '@react-three/fiber'
import { throttle } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Matrix4 } from 'three'

// Inspired by https://www.twingate.com/

interface Dot {
  p: THREE.Vector2
  sp: THREE.Vector2
}

interface Dots {
  width: number
  height: number
  values: Dot[]
}

function times(n: number) {
  const arr: number[] = []
  for (let i = 0; i < n; i++) {
    arr[i] = i
  }
  return arr
}

function getDots({ width, height }: { width: number; height: number }): Dots {
  const dots: Dot[] = []
  const numCols = 15
  const numRows = 15
  times(numRows).forEach((row) => {
    times(numCols).forEach((col) => {
      const x = (width / numCols) * col + width / numCols / 2
      const y = (height / numRows) * row + height / numRows / 2
      dots.push({
        p: new THREE.Vector2(x, y),
        sp: new THREE.Vector2((x / width) * 2 - 1, (y / height) * 2 - 1),
      })
    })
  })

  dots.forEach((dot) => {
    dot.p.x -= width / 2
    dot.p.y -= height / 2
  })

  return { values: dots, width, height }
}

interface SceneProps {
  dots: Dots
}

function Scene({ dots }: SceneProps) {
  const [mesh, setMesh] = useState<THREE.InstancedMesh | null>(null)

  let i = 0
  const matrix = new Matrix4()
  const baseColor = new THREE.Color(0.5, 0.5, 0.5)

  const log = throttle<typeof console.log>(console.log, 100)

  useFrame(({ pointer }) => {
    if (!mesh) {
      return
    }

    for (i = 0; i < dots.values.length; i++) {
      const dot = dots.values[i]

      let color = baseColor
      let pos = dot.p

      if (pointer.length() > 0) {
        const dp = Math.abs(dot.sp.distanceTo(pointer))
        if (dp < 0.33) {
          color = new THREE.Color(color).lerp(
            new THREE.Color(1, 0, 1),
            1 - dp * 4,
          )
        }
      }

      mesh.setColorAt(i, color)
      if (!mesh.instanceColor) {
        throw Error('no instance color?')
      }
      mesh.instanceColor.needsUpdate = true

      matrix.setPosition(pos.x, pos.y, 0)

      mesh.setMatrixAt(i, matrix)
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={setMesh}
      args={[undefined, undefined, dots.values.length]}
    >
      <circleGeometry attach="geometry" args={[3]} />
      <meshStandardMaterial attach="material" />
    </instancedMesh>
  )
}

interface InnerProps {
  canvas: HTMLCanvasElement
}

function Inner({ canvas }: InnerProps) {
  const { width, height } = canvas.getBoundingClientRect()
  const dots = useMemo<Dots>(() => {
    return getDots({
      width: width * window.devicePixelRatio,
      height: height * window.devicePixelRatio,
    })
  }, [width, height])

  useEffect(() => {
    console.log('dots', dots)
  }, [dots])

  return (
    <>
      {dots && <Scene dots={dots} />}
      <ambientLight color={0xffffff} intensity={1} />
      <color attach="background" args={['#111']} />
    </>
  )
}

export function ThreeDemo() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  return (
    <Canvas orthographic={true} dpr={window.devicePixelRatio} ref={setCanvas}>
      {canvas && <Inner canvas={canvas} />}
    </Canvas>
  )
}
