import React from 'react'
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'
import styled from 'styled-components'
import { ThreeDemo } from './three-demo'

const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const Nav = styled.nav`
  display: flex;
  flex-direction: row;
`

const Main = styled.div`
  flex: 1;
`

function Layout() {
  return (
    <Page>
      <Main>
        <Outlet />
      </Main>
    </Page>
  )
}

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

function Home() {
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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
