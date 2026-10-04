// Fournit l'utilisateur courant à l'application : restauration de session au
// chargement (cookie httpOnly posé par l'API), connexion, inscription, déconnexion.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from '../lib/api'
import { login as apiLogin, logout as apiLogout, me as apiMe, register as apiRegister } from '../services/authService'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiMe()
      .then((res) => {
        if (!cancelled && res?.ok) setUser(res.user)
      })
      .catch(() => {
        // Pas de session valide : on reste déconnecté.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (identifier, password) => {
    try {
      const res = await apiLogin(identifier, password)
      if (!res?.ok) return { ok: false, message: res?.message ?? 'Identifiants invalides.' }
      setUser(res.user)
      return { ok: true, user: res.user }
    } catch (err) {
      return { ok: false, message: getErrorMessage(err), details: err?.details }
    }
  }, [])

  const signUp = useCallback(async (data) => {
    try {
      const res = await apiRegister(data)
      if (!res?.ok) return { ok: false, message: res?.message ?? 'Inscription impossible.' }
      setUser(res.user)
      return { ok: true, user: res.user }
    } catch (err) {
      return { ok: false, message: getErrorMessage(err), details: err?.details }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // La session locale est fermée quoi qu'il arrive.
    } finally {
      setUser(null)
    }
  }, [])

  // Recharge le compte depuis l'API : à appeler après une modification de profil
  // pour que la barre de navigation et les espaces affichent la nouvelle identité.
  const refresh = useCallback(async () => {
    try {
      const res = await apiMe()
      setUser(res?.ok ? res.user : null)
      return res?.ok ? res.user : null
    } catch {
      setUser(null)
      return null
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, refresh }),
    [user, loading, signIn, signUp, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
