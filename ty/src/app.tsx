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
      <Nav>
        <Link to="/">Home</Link>
        <Link to="/three-demo">ThreeDemo</Link>
      </Nav>
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
          <Route index />
          <Route path="three-demo" element={<ThreeDemo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
