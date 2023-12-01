import { createContext } from 'react'
import { AppState } from '../types.js'

export const AppContext = createContext<AppState | null>(
  null,
)
