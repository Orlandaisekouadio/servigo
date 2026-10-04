// Formulaire d'inscription — partagé par /inscription (client + artisan) et /devenir-artisan.
import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useCommunes, useServices } from '../hooks/useReferentials'

export default function SignupForm({ initialType = 'client', showTypeToggle = true }) {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  // `?from=` : le visiteur était envoyé ici pour poser un favori. Une fois le
  // compte créé, on le ramène là-bas plutôt qu'à son espace.
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')
  const [type, setType] = useState(initialType === 'artisan' ? 'artisan' : 'client')
  const [showPassword, setShowPassword] = useState(false)
  // Zones et métiers viennent du catalogue administrable. Aucune liste de repli
  // n'est maintenue ici : le serveur refuse une commune ou un métier hors
  // catalogue, donc proposer une valeur périmée ferait échouer l'inscription
  // avec un message incompréhensible. En cas de panne, on le dit et on bloque.
  const { valeur: services, chargement: servicesChargement, erreur: servicesErreur } = useServices()
  const { valeur: communes, chargement: communesChargement, erreur: communesErreur } = useCommunes()
  const specialites = services.map((s) => s.name).filter(Boolean)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    commune: '',
    specialite: '',
    password: '',
    agree: false,
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const summaryRef = useRef(null)
  const successRef = useRef(null)

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setServerError('')
  }

  const validateField = (field) => {
    if (field === 'name') return form.name.trim() ? '' : 'Indiquez votre nom et prénoms.'
    if (field === 'phone') {
      const digits = form.phone.replace(/[\s-]/g, '')
      if (!digits) return 'Indiquez votre numéro.'
      return /^0\d{9}$/.test(digits) ? '' : 'Numéro invalide (10 chiffres, commence par 0).'
    }
    if (field === 'commune') return form.commune ? '' : 'Choisissez votre zone.'
    if (field === 'specialite') return type !== 'artisan' || form.specialite ? '' : 'Indiquez votre métier.'
    if (field === 'password') return form.password.length >= 8 ? '' : 'Au moins 8 caractères.'
    if (field === 'agree') return form.agree ? '' : 'Vous devez accepter les conditions.'
    return ''
  }

  // Validation au blur : un champ quitté vide ou invalide est signalé tout de suite.
  // On ne conserve que les messages non vides : sinon la clé subsisterait avec une
  // valeur vide et le résumé « Veuillez corriger… » s'afficherait à tort.
  const onBlur = (field) => () => {
    const err = validateField(field)
    setErrors((prev) => {
      const next = { ...prev }
      if (err) next[field] = err
      else delete next[field]
      return next
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setServerError('')
    const fields = ['name', 'phone', 'commune', 'password', 'agree']
    if (type === 'artisan') fields.push('specialite')
    const next = {}
    for (const f of fields) {
      const err = validateField(f)
      if (err) next[f] = err
    }
    setErrors(next)
    if (Object.keys(next).length > 0) {
      // Résumé focusable : annonce les champs à corriger aux lecteurs d'écran et au clavier.
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setSubmitting(true)
    const res = await signUp({
      name: form.name.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      commune: form.commune,
      password: form.password,
      role: type,
      specialite: type === 'artisan' ? form.specialite : '',
    })
    setSubmitting(false)

    if (!res?.ok) {
      // L'API renvoie ses erreurs champ par champ (zod) : on les rattache aux champs.
      const known = ['name', 'phone', 'commune', 'password', 'specialite']
      const mapped = {}
      for (const d of res?.details ?? []) {
        if (known.includes(d?.field)) mapped[d.field] = d.message
      }
      if (Object.keys(mapped).length > 0) {
        setErrors(mapped)
        requestAnimationFrame(() => summaryRef.current?.focus())
        return
      }
      setServerError(res?.message || 'Inscription impossible. Réessayez.')
      return
    }

    setSent(true)
    requestAnimationFrame(() => successRef.current?.focus())
  }

  const goToSpace = () => {
    // Chemin interne uniquement : une URL complète ferait de la page un relais
    // de redirection ouverte.
    const cible = from && from.startsWith('/') && !from.startsWith('//') ? from : null
    if (cible) {
      navigate(cible, { replace: true })
      return
    }
    navigate(type === 'artisan' ? '/espace-artisan' : '/espace-client', { replace: true })
  }

  const inputWrap = (field) =>
    `rounded-xl border bg-white ${
      errors[field]
        ? 'border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error/20'
        : 'border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
    }`

  const errorText = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1.5 text-xs font-medium text-error">
        {errors[field]}
      </p>
    ) : null

  const summaryEntry = (field, id, label) =>
    errors[field] && (
      <li>
        <a href={`#${id}`} className="font-medium underline">
          {label}
        </a>
      </li>
    )

  return (
    <>
      {sent ? (
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="rounded-xl border border-primary/20 bg-primary-soft/60 p-6 text-center"
        >
          <span className="material-symbols-outlined mb-3 text-4xl text-primary" aria-hidden="true">
            check_circle
          </span>
          <p className="mb-1 text-lg font-bold text-primary-deep">Compte créé avec succès !</p>
          <p className="mb-5 text-sm text-slate-600">
            Votre compte {type === 'artisan' ? 'artisan' : 'client'} est actif. Vous pouvez
            maintenant accéder à votre espace personnel.
          </p>
          <button
            type="button"
            onClick={goToSpace}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Accéder à mon espace
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">
                error
              </span>
              <p>{serverError}</p>
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              data-error-summary
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <p className="mb-2 font-bold">Veuillez corriger les champs suivants :</p>
              <ul className="list-disc space-y-1 pl-5">
                {summaryEntry('name', 'name', 'Nom et Prénoms')}
                {summaryEntry('phone', 'phone', 'Numéro de téléphone')}
                {summaryEntry('commune', 'commune', 'Commune ou ville')}
                {summaryEntry('specialite', 'specialite', 'Spécialité')}
                {summaryEntry('password', 'password', 'Mot de passe')}
                {summaryEntry('agree', 'agree', "L'acceptation des conditions")}
              </ul>
            </div>
          )}

        {showTypeToggle && (
          <>
            <p className="mb-2 text-sm font-semibold">Je souhaite :</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('client')}
                aria-pressed={type === 'client'}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  type === 'client'
                    ? 'border-primary bg-primary-soft/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    type === 'client' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">person_pin_circle</span>
                </span>
                <span>
                  <span className="block text-sm font-bold">Je suis Client</span>
                  <span className="block text-xs text-slate-500">Je cherche un artisan</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType('artisan')}
                aria-pressed={type === 'artisan'}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  type === 'artisan'
                    ? 'border-primary bg-primary-soft/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    type === 'artisan' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">construction</span>
                </span>
                <span>
                  <span className="block text-sm font-bold">Je suis Artisan</span>
                  <span className="block text-xs text-slate-500">Je propose mes services</span>
                </span>
              </button>
            </div>
          </>
        )}

        <div className="mb-5">
          <label htmlFor="name" className="mb-2 block text-sm font-semibold">
            Nom et Prénoms <span className="text-error">*</span>
          </label>
          <div className={`flex items-center gap-3 ${inputWrap('name')} px-4 py-3`}>
            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">badge</span>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              onBlur={onBlur('name')}
              placeholder="Ex : Awa Koné"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="w-full text-sm outline-none"
            />
          </div>
          {errorText('name')}
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
            Numéro de Téléphone (Mobile Money & WhatsApp) <span className="text-error">*</span>
          </label>
          <div className={`flex items-center overflow-hidden rounded-xl border bg-white ${errors.phone ? 'border-error ring-2 ring-error/20' : 'border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
            <span className="flex items-center gap-1 border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
              🇨🇮 +225
            </span>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              onBlur={onBlur('phone')}
              placeholder="07 00 00 00 00"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className="w-full px-4 py-3 text-sm outline-none"
            />
          </div>
          {errorText('phone')}
          <p className="mt-1.5 text-xs text-slate-500">
            Compatible Orange, MTN, Wave et Moov Money.
          </p>
        </div>

        <div className="mb-5">
          <label htmlFor="commune" className="mb-2 block text-sm font-semibold">
            Commune ou Ville de résidence <span className="text-error">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
              location_on
            </span>
            <select
              id="commune"
              value={form.commune}
              onChange={set('commune')}
              onBlur={onBlur('commune')}
              disabled={communesChargement || Boolean(communesErreur)}
              aria-invalid={!!errors.commune}
              aria-busy={communesChargement}
              aria-describedby={
                errors.commune ? 'commune-error' : communesErreur ? 'commune-chargement' : undefined
              }
              className={`w-full appearance-none rounded-xl border bg-white py-3 pr-10 pl-12 text-sm outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.commune
                  ? 'border-error focus:border-error focus:ring-error/20'
                  : 'border-slate-300 focus:border-primary focus:ring-primary/20'
              }`}
            >
              <option value="" disabled>
                {communesChargement
                  ? 'Chargement des zones...'
                  : communesErreur
                    ? 'Zones indisponibles'
                    : 'Sélectionnez votre zone...'}
              </option>
              {communes.map((c) => (
                <option key={c._id ?? c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
              expand_more
            </span>
          </div>
          {/* Une liste de communes illisible ne se devine pas : le dire empêche
              l'utilisateur de soumettre un formulaire voué à être refusé. */}
          {communesErreur && (
            <p id="commune-chargement" role="alert" className="mt-2 text-sm text-error">
              Zones indisponibles : {communesErreur}. Rechargez la page pour réessayer.
            </p>
          )}
          {errorText('commune')}
        </div>

        {type === 'artisan' && (
          <div className="mb-5">
            <label htmlFor="specialite" className="mb-2 block text-sm font-semibold">
              Spécialité principale <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                handyman
              </span>
              <select
                id="specialite"
                value={form.specialite}
                onChange={set('specialite')}
                onBlur={onBlur('specialite')}
                disabled={servicesChargement || Boolean(servicesErreur)}
                aria-invalid={!!errors.specialite}
                aria-busy={servicesChargement}
                aria-describedby={
                  errors.specialite
                    ? 'specialite-error'
                    : servicesErreur
                      ? 'specialite-chargement'
                      : undefined
                }
                className={`w-full appearance-none rounded-xl border bg-white py-3 pr-10 pl-12 text-sm outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                  errors.specialite
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                }`}
              >
                <option value="" disabled>
                  {servicesChargement
                    ? 'Chargement des métiers...'
                    : servicesErreur
                      ? 'Métiers indisponibles'
                      : 'Indiquez votre métier...'}
                </option>
                {specialites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
                expand_more
              </span>
            </div>
            {servicesErreur && (
              <p id="specialite-chargement" role="alert" className="mt-2 text-sm text-error">
                Métiers indisponibles : {servicesErreur}. Rechargez la page pour réessayer.
              </p>
            )}
            {errorText('specialite')}
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold">
              Mot de passe sécurisé <span className="text-error">*</span>
            </label>
            <span className="text-xs text-slate-500">Au moins 8 caractères</span>
          </div>
          <div className={`flex items-center gap-3 ${inputWrap('password')} px-4 py-3`}>
            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">lock</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              onBlur={onBlur('password')}
              placeholder="Créez un mot de passe"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="w-full text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="text-slate-500 transition-colors hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errorText('password')}
        </div>

        <div className="mb-6">
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              id="agree"
              type="checkbox"
              checked={form.agree}
              onChange={set('agree')}
              aria-invalid={!!errors.agree}
              aria-describedby={errors.agree ? 'agree-error' : undefined}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#16a34a]"
            />
            <span>
              J&apos;accepte sans réserve les{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Conditions Générales
              </a>{' '}
              et la{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Politique de Confidentialité
              </a>{' '}
              de ServiGo Côte d&apos;Ivoire.
            </span>
          </label>
          {errorText('agree')}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Création du compte…' : 'Créer mon compte ServiGo'}
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </form>
      )}
    </>
  )
}

