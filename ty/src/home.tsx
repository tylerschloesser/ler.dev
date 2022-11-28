import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { PATHS } from './paths'

const HomeContainer = styled.div`
  position: relative;
`

const HomeTitle = styled.h1`
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  color: rgb(200, 200, 200, 0.9);
  position: fixed;
  font-size: 2rem;
  bottom: 0;
  right: 0;
  padding: 2rem;
`

const Period = styled.span`
  margin: 0 -0.2rem;
`

const List = styled.ol``

export function Home() {
  return (
    <HomeContainer>
      <HomeTitle>
        ty<Period>.</Period>ler<Period>.</Period>dev
      </HomeTitle>
      <List>
        <li>
          <Link to={PATHS.dots}>DOTS</Link>
        </li>
      </List>
    </HomeContainer>
  )
}
