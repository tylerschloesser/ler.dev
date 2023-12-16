import { Suspense } from 'react'
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { styled } from 'styled-components'
import { Home } from './home.js'
import { PATHS } from './paths.js'

const Page = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const Main = styled.div`
  flex: 1;
  height: 100%;
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
      <Suspense fallback={<div>loading</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {PATHS.map(({ path, Component }, i) => (
              <Route
                key={i}
                path={path}
                element={<Component />}
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
