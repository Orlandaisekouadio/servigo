// Contexte React de session — fichier séparé pour la règle oxlint
// `react/only-export-components` (« move your React context(s) to a separate file »).
import { createContext } from 'react'

export const SessionContext = createContext(null)
