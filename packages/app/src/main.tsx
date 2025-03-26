import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'
import React from 'react'
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

const message = 'Howdy, stranger.'
const chars = message.split('')
console.log(
  chars.map((c) => `%c${c}`).join(''),
  ...chars.map(
    (_, i) =>
      `color: hsl(${Math.floor((i / chars.length) * 360)}, 80%, 80%)`,
  ),
)

const root = ReactDOM.createRoot(container)
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
