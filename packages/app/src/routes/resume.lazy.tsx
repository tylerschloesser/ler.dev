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
        <div className="bg-gradient-to-b from-green-900 to-black min-h-screen">
          <div className="md:p-8 flex justify-center items-center min-h-screen">
            <div className="relative p-0.5 overflow-hidden">
              <div
                className={clsx(
                  'motion-reduce:hidden',
                  'absolute -inset-full',
                  'bg-conic-180 from-black from-25% via-white to-75% to-black',
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
