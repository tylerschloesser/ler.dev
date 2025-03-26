import { createLazyFileRoute } from '@tanstack/react-router'
import { Resume } from '../resume'

export const Route = createLazyFileRoute('/resume')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="print:hidden">
        <div className="md:p-8 flex justify-center">
          <div className="border-2 shadow-xl">
            <div className="max-w-4xl">
              <Resume />
            </div>
          </div>
        </div>
      </div>
      <div className="not-print:hidden">
        <Resume />
      </div>
    </>
  )
}
