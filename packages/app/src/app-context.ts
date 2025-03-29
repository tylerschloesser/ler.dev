import React from 'react'

export interface IAppContext {
  isFirstLoad: React.RefObject<boolean>
}

export const AppContext = React.createContext<IAppContext>(
  null!,
)
