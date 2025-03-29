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
        <div className="min-h-screen">
          <div className="md:p-8 flex justify-center items-center min-h-screen">
            <div className="shadow-2xl">
              <div className="relative md:p-0.5 overflow-hidden bg-black">
                <div
                  className={clsx(
                    'motion-reduce:hidden',
                    'absolute -inset-full',
                    'bg-conic-180 from-gray-800 from-25% via-green-800 to-75% to-gray-800',
                    'animate-spin',
                    'rotate-270',
                  )}
                  style={{ animationDuration: '20s' }}
                />

                <div className="relative">
                  <div className="max-w-4xl bg-white">
                    <Resume />
                  </div>
                </div>
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
