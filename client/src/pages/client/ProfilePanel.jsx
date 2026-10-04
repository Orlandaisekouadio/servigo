// Panneau « Profil » (client) — modification des informations du compte.
// Le nom et la commune sont enregistrés via PUT /api/auth/me ; le mot de passe
// se change à part (PUT /api/auth/password) car il exige le mot de passe actuel.
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../../auth/useAuth'
import { getErrorMessage } from '../../lib/api'
import { changePassword, updateMe } from '../../services/authService'

export default function ProfilePanel() {
  const { user, refresh } = useAuth()
  const [form, setForm] = useState({ name: user?.name ?? '', commune: user?.commune ?? '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [pwdState, setPwdState] = useState({ saved: false, error: '', saving: false })

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await updateMe({
        name: form.name.trim(),
        commune: form.commune.trim(),
      })
      if (!res?.ok) throw new Error(res?.message || "L'enregistrement a échoué.")
      // L'API renvoie le compte à jour : on resynchronise le formulaire dessus.
      setForm({ name: res.user.name ?? '', commune: res.user.commune ?? '' })
      await refresh()
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    setPwdState({ saved: false, error: '', saving: true })
    try {
      const res = await changePassword(pwd)
      if (!res?.ok) {
        setPwdState({ saved: false, error: res?.message || 'Changement impossible.', saving: false })
        return
      }
      setPwd({ currentPassword: '', newPassword: '' })
      setPwdState({ saved: true, error: '', saving: false })
    } catch (err) {
      setPwdState({ saved: false, error: getErrorMessage(err), saving: false })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil utilisateur</CardTitle>
          <CardDescription className="mt-0.5">
            Votre nom et votre commune. Le téléphone reste votre identifiant de connexion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name" className="mb-2 block font-semibold">
                  Nom complet
                </Label>
                <Input id="c-name" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <Label htmlFor="c-location" className="mb-2 block font-semibold">
                  Commune
                </Label>
                <Input
                  id="c-location"
                  value={form.commune}
                  onChange={set('commune')}
                  placeholder="Cocody"
                />
              </div>
              <div>
                <Label htmlFor="c-phone" className="mb-2 block font-semibold">
                  Téléphone / WhatsApp
                </Label>
                <Input id="c-phone" type="tel" value={user?.phone ?? ''} readOnly disabled />
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  Identifiant de connexion : demandez à l&apos;équipe pour le modifier.
                </p>
              </div>
              <div>
                <Label htmlFor="c-email" className="mb-2 block font-semibold">
                  Adresse email
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  value={user?.email ?? ''}
                  placeholder="vous@exemple.ci"
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
              {saved && (
                <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary-deep">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    check_circle
                  </span>
                  Modifications enregistrées
                </p>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-error">
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  error
                </span>
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mot de passe</CardTitle>
          <CardDescription className="mt-0.5">
            Au moins 8 caractères. Votre mot de passe actuel est demandé pour confirmer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-current" className="mb-2 block font-semibold">
                  Mot de passe actuel
                </Label>
                <Input
                  id="c-current"
                  type="password"
                  value={pwd.currentPassword}
                  onChange={(e) => {
                    setPwd((p) => ({ ...p, currentPassword: e.target.value }))
                    setPwdState((s) => ({ ...s, saved: false, error: '' }))
                  }}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label htmlFor="c-password" className="mb-2 block font-semibold">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="c-password"
                  type="password"
                  value={pwd.newPassword}
                  onChange={(e) => {
                    setPwd((p) => ({ ...p, newPassword: e.target.value }))
                    setPwdState((s) => ({ ...s, saved: false, error: '' }))
                  }}
                  placeholder="Nouveau mot de passe"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={pwdState.saving}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary px-8 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pwdState.saving ? 'Modification…' : 'Changer mon mot de passe'}
              </button>
              {pwdState.saved && (
                <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary-deep">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    check_circle
                  </span>
                  Mot de passe mis à jour
                </p>
              )}
            </div>
            {pwdState.error && (
              <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-error">
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  error
                </span>
                {pwdState.error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}