import React from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { Home } from './home'

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
