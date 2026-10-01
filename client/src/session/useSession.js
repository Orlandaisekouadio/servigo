// Hook de session — fichier séparé pour la règle oxlint
// `react/only-export-components` (Fast refresh ne veut qu'un export composant
// par fichier). Import : `import { useSession } from '../session/useSession'`.
import { useContext } from 'react'
import { SessionContext } from './session-context'

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession doit être utilisé dans <SessionProvider>')
  return ctx
}
