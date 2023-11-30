import { ErrorBoundary } from 'react-error-boundary'
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import { AddGear } from './add-gear.component.js'
import { App } from './app.component.js'
import { ApplyForce } from './apply-force.component.js'
import { Toolbar } from './toolbar.component.js'

// TODO cleanup errors
// https://github.com/facebook/react/issues/15069

const router = createBrowserRouter([
  {
    // only relevent during development
    index: true,
    Component: () => <Navigate to="gears" />,
  },
  {
    path: 'gears',
    Component: App,
    children: [
      {
        index: true,
        Component: Toolbar,
      },
      {
        path: 'add-gear',
        Component: AddGear,
      },
      {
        path: 'apply-force',
        Component: ApplyForce,
      },
    ],
  },
])

export function DemoGear() {
  return (
    <ErrorBoundary fallback={<>Error</>}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
