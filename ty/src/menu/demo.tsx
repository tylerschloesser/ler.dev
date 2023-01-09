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

const Title = styled.div`
  position: fixed;
  left: 50vw;
  bottom: 50vh;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
  padding-right: 0.5rem;
  border-bottom: 2px solid hsl(0, 0%, 90%);
`

const TitleLine = styled.div``

export function Demo() {
  const images = shuffle(times(5)).map((i) => (
    <ImageListItem>
      <Image key={i} src={`menu-demo-${i + 1}.jpg`} />
    </ImageListItem>
  ))

  return (
    <>
      <Title>
        {'The future is futuristic'.split(' ').map((line) => (
          <TitleLine key={line}>{line}</TitleLine>
        ))}
      </Title>
      <ImageList>{images}</ImageList>
    </>
  )
}
