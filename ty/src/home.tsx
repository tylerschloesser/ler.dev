import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
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

export function Home() {
  return (
    <HomeContainer>
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
    </HomeContainer>
  )
}
