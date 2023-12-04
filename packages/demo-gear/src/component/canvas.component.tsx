import { useEffect, useState } from 'react'
import { AppState } from '../types.js'
import styles from './canvas.module.scss'

export interface CanvasProps {
  setCanvas(canvas: AppState['canvas']): void
}

export function Canvas({ setCanvas }: CanvasProps) {
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null)
  const [gpu, setGpu] = useState<HTMLCanvasElement | null>(
    null,
  )

  useEffect(() => {
    if (container && gpu) {
      setCanvas({ container, gpu })
    }
  }, [container, gpu])

  return (
    <div className={styles.container} ref={setContainer}>
      <canvas
        data-type="gpu"
        className={styles.canvas}
        ref={setGpu}
      />
    </div>
  )
}
