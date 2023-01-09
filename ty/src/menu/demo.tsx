import { shuffle, times } from 'lodash'
import React from 'react'

export function Demo() {
  const images = shuffle(times(5)).map((i) => (
    <img key={i} src={`menu-demo-${i + 1}.jpg`} width="200px" />
  ))

  return (
    <>
      demo
      {images}
    </>
  )
}
