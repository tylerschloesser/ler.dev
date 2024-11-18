import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import invariant from 'tiny-invariant'
import './index.css'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const container = document.getElementById('root')
invariant(container)

const root = ReactDOM.createRoot(container)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
