import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Matrix4 } from 'three'

// Inspired by https://www.twingate.com/

interface Vec2 {
  x: number
  y: number
}

interface Dot {
  p: Vec2
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
  const padding = Math.min(width, height) * 0.1
  const numCols = 10
  const numRows = 10
  times(numRows).forEach((y) => {
    times(numCols).forEach((x) => {
      dots.push({
        p: {
          x: padding + ((width - padding) / numCols) * x,
          y: padding + ((height - padding) / numRows) * y,
        },
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
  const color = new THREE.Color(0.5, 0.5, 0.5)
  //const color = new THREE.Color('rgba(87, 135, 255, 1)')

  useFrame(() => {
    if (!mesh) {
      return
    }
    for (i = 0; i < dots.values.length; i++) {
      mesh.setColorAt(i, color)
      if (!mesh.instanceColor) {
        throw Error('no instance color?')
      }
      mesh.instanceColor.needsUpdate = true

      matrix.setPosition(dots.values[i].p.x, dots.values[i].p.y, 0)

      mesh.setMatrixAt(i, matrix)
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={setMesh}
      args={[undefined, undefined, dots.values.length]}
    >
      <circleGeometry attach="geometry" args={[2]} />
      <meshStandardMaterial attach="material" color={color} />
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
    const onpointermove = (ev: PointerEvent) => {
      const x = Math.round(ev.x)
      const y = Math.round(ev.y)
    }
    canvas.addEventListener('pointermove', onpointermove)
    return () => canvas.removeEventListener('pointermove', onpointermove)
  }, [canvas])

  return (
    <>
      {dots && <Scene dots={dots} />}
      <ambientLight color={0xfff} intensity={1} />
      <color attach="background" args={['#aaa']} />
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
