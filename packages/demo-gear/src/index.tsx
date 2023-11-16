import { ErrorBoundary } from 'react-error-boundary'
import { App } from './app.component.js'

// TODO cleanup errors
// https://github.com/facebook/react/issues/15069

export function DemoGear() {
  return (
    <ErrorBoundary fallback={<>Error</>}>
      <App />
    </ErrorBoundary>
  )
}
