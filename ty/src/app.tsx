import React from 'react'
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'
import { ThreeDemo } from './three-demo'

function Layout() {
  return (
    <>
      <Link to="/">Home</Link>
      <Link to="/three-demo">ThreeDemo</Link>
      <Outlet />
    </>
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
