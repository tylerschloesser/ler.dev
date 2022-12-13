import React from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { Games } from './games'
import { Home } from './home'
import { Menu } from './menu'
import { PATHS } from './paths'
import { ThreeDemo } from './three-demo'

const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={PATHS.dots} element={<ThreeDemo />} />
          <Route path={PATHS.menu} element={<Menu />} />
          <Route path={PATHS.games} element={<Games />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
