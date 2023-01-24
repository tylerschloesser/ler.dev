import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { Home } from './home'
import { PATHS } from './paths'

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

const Dots = lazy(() => import('./three-demo'))

export const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>loading</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {PATHS.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="dots" element={<Dots />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
