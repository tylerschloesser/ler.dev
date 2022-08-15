import { Canvas, useFrame, MeshProps, ThreeElements } from '@react-three/fiber'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function Box(props: MeshProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current!.rotation.x += 0.01))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

interface Vec2 {
  x: number
  y: number
}

interface Dot {
  p: Vec2
}

function times(n: number) {
  const arr: number[] = []
  for (let i = 0; i < n; i++) {
    arr[i] = i
  }
  return arr
}

function getDots({ width, height }: { width: number; height: number }): Dot[] {
  const dots: Dot[] = []
  const padding = Math.min(width, height) * 0.1
  const numCols = 10,
    numRows = 10
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
  return dots
}

function Scene() {
  const mesh = useRef<THREE.InstancedMesh>(null)

  useFrame(() => {})
  return <instancedMesh ref={mesh}></instancedMesh>
}

export function ThreeDemo() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [dots, setDots] = useState<Dot[] | null>(null)
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
    <Canvas dpr={window.devicePixelRatio} ref={setCanvas}>
      <Scene />
    </Canvas>
  )
}
