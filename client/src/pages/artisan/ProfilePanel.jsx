// Panneau « Profil » — modifier les informations (démo : mémoire de session).
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

export default function ProfilePanel({ account }) {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: account.name,
    role: account.role,
    location: account.location,
    phone: '+225 07 12 34 56 89',
    whatsapp: '+225 07 12 34 56 89',
    bio: '',
  })

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informations du profil</CardTitle>
        <CardDescription className="mt-0.5">
          Ces informations alimentent votre profil public. Démo : les changements restent en
          mémoire pendant la session et sont réinitialisés au rechargement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-name" className="mb-2 block font-semibold">
                Nom complet
              </Label>
              <Input id="a-name" value={form.name} onChange={set('name')} />
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
              <Input id="a-location" value={form.location} onChange={set('location')} />
            </div>
            <div>
              <Label htmlFor="a-phone" className="mb-2 block font-semibold">
                Téléphone
              </Label>
              <Input id="a-phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <Label htmlFor="a-wa" className="mb-2 block font-semibold">
                WhatsApp
              </Label>
              <Input id="a-wa" type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
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
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep"
            >
              Enregistrer les modifications
            </button>
            {saved && (
              <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary-deep">
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  check_circle
                </span>
                Modifications enregistrées (démo)
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Photo de profil et statut « vérifié » non modifiables ici (démo).
          </p>
        </form>
      </CardContent>
    </Card>
  )
}