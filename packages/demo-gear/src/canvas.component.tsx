import { useEffect, useState } from 'react'
import styles from './canvas.module.scss'

export interface CanvasProps {
  setCanvas(canvas: {
    container: HTMLDivElement
    cpu: HTMLCanvasElement
    gpu: HTMLCanvasElement
  }): void
}

export function Canvas({ setCanvas }: CanvasProps) {
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null)
  const [cpuCanvas, setCpuCanvas] =
    useState<HTMLCanvasElement | null>(null)
  const [gpuCanvas, setGpuCanvas] =
    useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (container && cpuCanvas && gpuCanvas) {
      setCanvas({
        container,
        cpu: cpuCanvas,
        gpu: gpuCanvas,
      })
    }
  }, [container, cpuCanvas, gpuCanvas])

  return (
    <div className={styles.container} ref={setContainer}>
      <canvas
        data-type="gpu"
        className={styles.canvas}
        ref={setGpuCanvas}
      />
      <canvas
        data-type="cpu"
        className={styles.canvas}
        ref={setCpuCanvas}
      />
    </div>
  )
}
