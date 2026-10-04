// Hook d'authentification — fichier séparé pour la règle oxlint
// `react/only-export-components`. Import : `import { useAuth } from '../auth/useAuth'`.
import { useContext } from 'react'
import { AuthContext } from './auth-context'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
