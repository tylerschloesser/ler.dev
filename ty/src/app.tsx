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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ThreeDemo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
