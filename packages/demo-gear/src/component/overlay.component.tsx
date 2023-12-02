import React, { useEffect, useState } from 'react'
import styles from './overlay.module.scss'

export type OverlayProps = React.PropsWithChildren<{
  position?: 'top' | 'bottom'
}>

export function Overlay({
  position = 'bottom',
  children,
}: OverlayProps) {
  const [overflow, setOverflow] = useState(false)
  const [outer, setOuter] = useState<HTMLDivElement | null>(
    null,
  )
  useEffect(() => {
    if (!outer) return

    if (outer.scrollWidth > outer.clientWidth) {
      // start out scrolled all the way to the right
      outer.scrollTo({
        left: outer.scrollWidth - outer.clientWidth,
      })

      setOverflow(true)
    }
  }, [outer])

  return (
    <div
      className={
        position === 'top'
          ? styles['outer-top']
          : styles['outer-bottom']
      }
      ref={setOuter}
      data-overflow={overflow}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  )
}
