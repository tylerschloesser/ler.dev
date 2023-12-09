import { use, useEffect, useState } from 'react'
import { BuildVersionListenerFn } from '../types.js'
import { AppContext } from './context.js'

export function useWorldBuildVersion(): number {
  const context = use(AppContext)
  const [buildVersion, setBuildVersion] = useState<number>(
    context.buildVersion,
  )
  useEffect(() => {
    const listener: BuildVersionListenerFn = (next) => {
      setBuildVersion(next)
    }
    context.buildVersionListeners.add(listener)
    return () => {
      context.buildVersionListeners.delete(listener)
    }
  }, [context])
  return buildVersion
}
