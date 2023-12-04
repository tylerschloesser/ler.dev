import { ErrorBoundary } from 'react-error-boundary'
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import { routes } from './routes.js'

// TODO cleanup errors
// https://github.com/facebook/react/issues/15069

const router = createBrowserRouter(routes)

export function DemoGear() {
  return (
    <ErrorBoundary fallback={<>Error</>}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
