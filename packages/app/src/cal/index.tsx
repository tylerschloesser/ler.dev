import { times } from 'lodash'
import { useState } from 'react'
import { styled } from 'styled-components'

const Container = styled.div`
  width: 100vw;
  height: 100vh;

  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);

  color: white;
`

const Cell = styled.div`
  display: flex;
  flex-direction: row-reverse;
`

export function Cal() {
  const [_, setContainer] =
    useState<HTMLDivElement | null>()

  return (
    <Container ref={setContainer}>
      {times(14).map((i) => (
        <Cell key={i}>{i + 1}</Cell>
      ))}
    </Container>
  )
}
