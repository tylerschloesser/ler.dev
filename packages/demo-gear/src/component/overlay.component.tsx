import React, { useEffect, useState } from 'react'
import styles from './overlay.module.scss'

export type OverlayProps = React.PropsWithChildren<{
  position?: 'top' | 'bottom'
}>

export function Overlay({
  position = 'bottom',
  children,
}: OverlayProps) {
  const [outer, setOuter] = useState<HTMLDivElement | null>(
    null,
  )
  useEffect(() => {
    if (!outer) return
    // start out scrolled all the way to the right
    outer.scrollTo({
      left: outer.scrollWidth - outer.clientWidth,
    })
  }, [outer])

  return (
    <div
      className={
        position === 'top'
          ? styles['outer-top']
          : styles['outer-bottom']
      }
      ref={setOuter}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  )
}
