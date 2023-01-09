import { shuffle, times } from 'lodash'
import React from 'react'
import styled from 'styled-components'

const ImageList = styled.ol`
  display: flex;
  flex-direction: column;
  width: 50vw;
`

const ImageListItem = styled.li`
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;

  &:not(:last-child) {
    padding-bottom: 0;
  }
`

const Image = styled.img`
  width: 100%;
`

export function Demo() {
  const images = shuffle(times(5)).map((i) => (
    <ImageListItem>
      <Image key={i} src={`menu-demo-${i + 1}.jpg`} />
    </ImageListItem>
  ))

  return (
    <>
      <ImageList>{images}</ImageList>
    </>
  )
}
