import React from 'react'
import styled from 'styled-components'
import { ThreeDemo } from './three-demo'

const HomeContainer = styled.div`
  position: relative;
`

const HomeBackground = styled.div`
  position: relative;
`

const HomeTitle = styled.h1`
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  color: rgb(200, 200, 200, 0.9);
  position: fixed;
  font-size: min(8vh, 8vw);
  bottom: 0;
  right: 0;
  pointer-events: none;
  padding: min(4vh, 4vw);
`

const Period = styled.span`
  margin: 0 calc(min(1vh, 1vw) * -1);
`

export function Home() {
  return (
    <HomeContainer>
      <HomeBackground>
        <ThreeDemo />
      </HomeBackground>
      <HomeTitle>
        ty<Period>.</Period>ler<Period>.</Period>dev
      </HomeTitle>
    </HomeContainer>
  )
}
