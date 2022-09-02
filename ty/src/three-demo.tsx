import { Canvas, useFrame } from '@react-three/fiber'
import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import { Matrix4 } from 'three'

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
          x: padding + ((width - padding * 2) / numCols) * x,
          y: padding + ((height - padding * 2) / numRows) * y,
        },
      })
    })
  })
  return { values: dots, width, height }
}

function Scene({ dots }: { dots: Dots }) {
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

      matrix.setPosition(
        dots.values[i].p.x * 2 - dots.width,
        dots.values[i].p.y * 2 - dots.height,
        2,
      )

      mesh.setMatrixAt(i, matrix)
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  useEffect(() => {
    console.log('we got the mesh')
  }, [mesh])

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

export function ThreeDemo() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [dots, setDots] = useState<Dots | null>(null)
  useEffect(() => {
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    setDots(getDots(rect))
  }, [canvas])

  useEffect(() => {
    if (!dots) {
      return
    }
    console.log(dots)
  }, [dots])

  return (
    <Canvas orthographic={true} dpr={window.devicePixelRatio} ref={setCanvas}>
      {dots && <Scene dots={dots} />}
      <ambientLight color={0xfff} intensity={1} />
      <color attach="background" args={['#aaa']} />
    </Canvas>
  )
}
