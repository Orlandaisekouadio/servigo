// Panneau « Profil » (client) — modifier ses informations (démo : session).
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function ProfilePanel({ account }) {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: account.name,
    location: account.location,
    phone: '+225 07 12 34 56 89',
    email: '',
    password: '',
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
        <CardTitle className="text-lg">Profil utilisateur</CardTitle>
        <CardDescription className="mt-0.5">
          Vos informations de contact et de connexion (démo : réinitialisées au rechargement).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name" className="mb-2 block font-semibold">
                Nom complet
              </Label>
              <Input id="c-name" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <Label htmlFor="c-location" className="mb-2 block font-semibold">
                Commune
              </Label>
              <Input id="c-location" value={form.location} onChange={set('location')} />
            </div>
            <div>
              <Label htmlFor="c-phone" className="mb-2 block font-semibold">
                Téléphone / WhatsApp
              </Label>
              <Input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <Label htmlFor="c-email" className="mb-2 block font-semibold">
                Adresse email
              </Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="vous@exemple.ci"
                autoComplete="email"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-password" className="mb-2 block font-semibold">
                Mot de passe
              </Label>
              <Input
                id="c-password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Nouveau mot de passe"
                autoComplete="new-password"
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
        </form>
      </CardContent>
    </Card>
  )
}