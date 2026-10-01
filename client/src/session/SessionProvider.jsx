// Session de démonstration — état en mémoire uniquement (aucune persistance, aucun
// backend) : il est réinitialisé au rechargement, comme le reste du produit.
// La session ne prétend pas authentifier qui que ce soit, elle porte toujours
// l'identité `clientAccount` et l'interface l'affiche comme telle.
// Découpage en trois fichiers (contexte / provider / hook) imposé par la règle oxlint
// `react/only-export-components`.
import { useCallback, useMemo, useState } from 'react'
import { SessionContext } from './session-context'
import { clientAccount } from '../data/clientAccount'

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)

  const signIn = useCallback(() => setUser(clientAccount), [])
  const signOut = useCallback(() => setUser(null), [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
