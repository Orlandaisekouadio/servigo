// Formulaire d'inscription (démo) — partagé par /inscription (client + artisan,
// avec bascule de profil) et /devenir-artisan (artisan uniquement, sans bascule).
// Aucun compte n'est créé : validation locale, état en mémoire, notice démo incluse.
import { useRef, useState } from 'react'

const communes = [
  'Cocody',
  'Yopougon',
  'Marcory',
  'Le Plateau',
  'Koumassi',
  'Treichville',
  'Port-Bouët',
  'Abobo',
  'Adjamé',
  'Bingerville',
  'Bouaké',
  'San-Pédro',
  'Yamoussoukro',
  'Autre localité',
]

const specialites = [
  'Électricité générale',
  'Plomberie & Sanitaire',
  'Froid & Climatisation',
  'Menuiserie',
  'Peinture',
  'Maçonnerie',
  'Serrurerie',
  'Autre service technique',
]

export default function SignupForm({ initialType = 'client', showTypeToggle = true }) {
  const [type, setType] = useState(initialType === 'artisan' ? 'artisan' : 'client')
  const [showPassword, setShowPassword] = useState(false)
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
  const summaryRef = useRef(null)
  const successRef = useRef(null)

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
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
  const onBlur = (field) => () => {
    const err = validateField(field)
    setErrors((prev) => ({ ...prev, [field]: err || undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
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
    setSent(true)
    requestAnimationFrame(() => successRef.current?.focus())
  }

  const reset = () => {
    setForm({ name: '', phone: '', commune: '', specialite: '', password: '', agree: false })
    setErrors({})
    setSent(false)
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
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-900"
        role="note"
      >
        <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">
          info
        </span>
        <p className="text-xs leading-5">
          <strong className="font-semibold">Démonstration :</strong> les comptes ne sont pas
          créés — aucune donnée n&apos;est enregistrée ni transmise.
        </p>
      </div>

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
          <p className="mb-1 text-lg font-bold text-primary-deep">Inscription bien remplie !</p>
          <p className="mb-5 text-sm text-slate-600">
            C&apos;est la fin de la démonstration : aucun compte n&apos;a été créé, aucune donnée
            n&apos;est enregistrée.
          </p>
          <button
            type="button"
            onClick={reset}
            className="min-h-12 rounded-full border border-primary/30 bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            Recommencer la démo
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
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
              aria-invalid={!!errors.commune}
              aria-describedby={errors.commune ? 'commune-error' : undefined}
              className={`w-full appearance-none rounded-xl border bg-white py-3 pr-10 pl-12 text-sm outline-none focus:ring-2 ${
                errors.commune
                  ? 'border-error focus:border-error focus:ring-error/20'
                  : 'border-slate-300 focus:border-primary focus:ring-primary/20'
              }`}
            >
              <option value="" disabled>
                Sélectionnez votre zone...
              </option>
              {communes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
              expand_more
            </span>
          </div>
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
                aria-invalid={!!errors.specialite}
                aria-describedby={errors.specialite ? 'specialite-error' : undefined}
                className={`w-full appearance-none rounded-xl border bg-white py-3 pr-10 pl-12 text-sm outline-none focus:ring-2 ${
                  errors.specialite
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                }`}
              >
                <option value="" disabled>
                  Indiquez votre métier...
                </option>
                {specialites.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
                expand_more
              </span>
            </div>
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
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.99]"
        >
          Créer mon compte ServiGo
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </form>
      )}

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-xs font-medium text-slate-500">OU INSCRIPTION IMMÉDIATE VIA</span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold transition-all hover:border-slate-400 hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" fill="#25D366" className="h-5 w-5" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          WhatsApp
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold transition-all hover:border-slate-400 hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
            />
          </svg>
          Google
        </button>
      </div>
    </>
  )
}
