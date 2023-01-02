import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Blob } from './blob'
import { PATHS } from './paths'

const HomeContainer = styled.div`
  height: 100%;
  --color-text: hsl(0, 0%, 80%);
`

const HomeTitle = styled.h1`
  font-weight: 700;
  color: var(--color-text);
  position: fixed;
  font-size: 2rem;
  bottom: 0;
  right: 0;
  padding: 2rem;
`

const Period = styled.span`
  margin: 0 -0.2rem;
`

const List = styled.ol`
  display: flex;
  flex-direction: column;
  font-size: 1.25rem;
`

const ListItem = styled.li``

const StyledLink = styled(Link)`
  display: block;
  padding: 0.5rem;
  color: var(--color-text);
`

const HomeBackground = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
`

const HomeForeground = styled.div`
  position: relative;
`

export function Home() {
  return (
    <HomeContainer>
      <HomeBackground>
        <Blob
          config={{
            parts: 500,
            xScale: 0.6,
            yScale: 0.6,
            zScale: 1 / 5_000,
          }}
        />
      </HomeBackground>
      <HomeForeground>
        <HomeTitle>
          ty<Period>.</Period>ler<Period>.</Period>dev
        </HomeTitle>
        <List>
          {PATHS.map(({ path }) => (
            <ListItem key={path}>
              <StyledLink to={path}>{path.toUpperCase()}</StyledLink>
            </ListItem>
          ))}
        </List>
      </HomeForeground>
    </HomeContainer>
  )
}
