// Panneau « Profil » (artisan) — modification des informations du profil,
// enregistrées via PATCH /api/artisans/me.
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useAuth } from '../../auth/useAuth'
import { getErrorMessage } from '../../lib/api'
import { updateMyArtisanProfile } from '../../services/artisanService'

export default function ProfilePanel({ profile, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || user?.name || '',
    role: profile?.role || user?.specialite || '',
    location: profile?.location || '',
    phone: profile?.phone || user?.phone || '',
    whatsapp: profile?.whatsapp || user?.phone || '',
    bio: profile?.bio || '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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
      const res = await updateMyArtisanProfile({
        name: form.name.trim(),
        role: form.role.trim(),
        location: form.location.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        whatsapp: form.whatsapp.replace(/[\s-]/g, ''),
        bio: form.bio.trim(),
      })
      if (!res?.ok) throw new Error(res?.message || "L'enregistrement a échoué.")
      onSaved?.(res.data)
      setForm({
        name: res.data.name ?? '',
        role: res.data.role ?? '',
        location: res.data.location ?? '',
        phone: res.data.phone ?? '',
        whatsapp: res.data.whatsapp ?? '',
        bio: res.data.bio ?? '',
      })
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informations du profil</CardTitle>
        <CardDescription className="mt-0.5">
          Ces informations alimentent votre profil public.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-name" className="mb-2 block font-semibold">
                Nom complet
              </Label>
              <Input id="a-name" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <Label htmlFor="a-role" className="mb-2 block font-semibold">
                Métier
              </Label>
              <Input id="a-role" value={form.role} onChange={set('role')} />
            </div>
            <div>
              <Label htmlFor="a-location" className="mb-2 block font-semibold">
                Commune &amp; quartier
              </Label>
              <Input
                id="a-location"
                value={form.location}
                onChange={set('location')}
                placeholder="Cocody, Riviera Bonoumin"
              />
            </div>
            <div>
              <Label htmlFor="a-phone" className="mb-2 block font-semibold">
                Téléphone
              </Label>
              <Input
                id="a-phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0700000000"
              />
            </div>
            <div>
              <Label htmlFor="a-wa" className="mb-2 block font-semibold">
                WhatsApp
              </Label>
              <Input
                id="a-wa"
                type="tel"
                value={form.whatsapp}
                onChange={set('whatsapp')}
                placeholder="0700000000"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="a-bio" className="mb-2 block font-semibold">
                Présentation
              </Label>
              <Textarea
                id="a-bio"
                value={form.bio}
                onChange={set('bio')}
                placeholder="Quelques lignes sur votre savoir-faire, vos années d'expérience..."
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

          <p className="mt-4 text-xs text-slate-500">
            Le statut « vérifié » est accordé par l&apos;équipe ServiGo après contrôle de vos
            pièces justificatives.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}