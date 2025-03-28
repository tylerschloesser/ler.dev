import { createLazyFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'
import { SHOW_GAME } from '../const'
import { Resume } from '../resume'

export const Route = createLazyFileRoute('/resume')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="print:hidden">
        <div className="bg-gradient-to-b from-green-900 to-black">
          <div className="md:p-8 flex justify-center">
            <div className="md:border-2 md:shadow-xl">
              <div className="max-w-4xl bg-white">
                <Resume />
              </div>
            </div>
          </div>
        </div>
      </div>
      {SHOW_GAME && (
        <div className="relative">
          <div className="bg-black h-screen flex items-center justify-center">
            <button
              className={clsx(
                'border border-white min-w-40 p-2 rounded',
                'cursor-pointer',
                'text-white',
                'hover:bg-white hover:text-black',
              )}
            >
              <span>I'm bored</span>
            </button>
          </div>
        </div>
      )}
      <div className="not-print:hidden">
        <Resume />
      </div>
    </>
  )
}
