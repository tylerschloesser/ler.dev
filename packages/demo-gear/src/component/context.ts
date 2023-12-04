import { createContext } from 'react'
import { IAppContext } from '../types.js'

export const AppContext = createContext<IAppContext>(null!)
