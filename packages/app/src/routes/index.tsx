import {
  Link,
  createFileRoute,
} from '@tanstack/react-router'
import clsx from 'clsx'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  useDisableOverscroll()
  return (
    <>
      <div className="relative">
        <div className="w-dvw h-dvh flex items-center justify-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-center">ty.ler.dev</h1>
            <Link
              onPointerOver={() => {
                console.log('over')
              }}
              onPointerLeave={() => {
                console.log('leave')
              }}
              to="/resume"
              className={clsx(
                'block border p-2 rounded min-w-40 text-center shadow',
                'hover:bg-black hover:text-white hover:border-black',
                'transition-colors',
              )}
            >
              Resume
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function useDisableOverscroll() {
  // prettier-ignore
  useEffect(() => {
    document.documentElement.classList.add('overscroll-none')
    document.body.classList.add('overscroll-none')
    return () => {
      document.documentElement.classList.remove('overscroll-none')
      document.body.classList.remove('overscroll-none')
    }
  }, [])
}
