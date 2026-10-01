import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import AuthShell from '../components/AuthShell'
import { useSession } from '../session/useSession'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
    </svg>
  )
}

export default function LoginPage() {
  const { signIn } = useSession()
  const [mode, setMode] = useState('phone')
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [signedIn, setSignedIn] = useState(false)

  const validate = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const ident = (mode === 'phone' ? data.get('phone') : data.get('email') || '').trim()
    if (!ident) {
      setErrorMsg(
        mode === 'phone'
          ? 'Indiquez votre numéro de téléphone.'
          : 'Indiquez votre adresse email.',
      )
      setHasError(true)
      setSignedIn(false)
      return
    }
    // Démonstration : aucune vérification réelle. On ouvre une session en mémoire
    // qui reprend le compte client de la vitrine (cf. data/clientAccount.js).
    signIn()
    setHasError(false)
    setErrorMsg('')
    setSignedIn(true)
  }

  return (
    <AuthShell
      title="L'excellence artisanale en Côte d'Ivoire"
      subtitle="Des professionnels vérifiés, prêts à intervenir en toute confiance."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="mb-6 flex items-center gap-2 text-sm font-medium">
        <Link
          to="/connexion"
          className="border-b-2 border-primary pb-1 text-primary"
        >
          Connexion
        </Link>
        <span className="text-slate-300">|</span>
        <Link to="/inscription" className="text-slate-500 transition-colors hover:text-primary">
          Créer un compte
        </Link>
      </div>

      <h2 className="mb-2 text-3xl font-bold tracking-tight">Connexion</h2>
      <p className="mb-8 text-slate-500">Bienvenue sur votre espace personnel ServiGo.</p>

      {signedIn && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4 text-primary-deep"
        >
          <p className="flex items-start gap-3 text-sm leading-6">
            <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">
              check_circle
            </span>
            <span>
              <span className="font-bold">Connecté (démo).</span> La session est ouverte en
              mémoire et sera perdue au rechargement de la page.
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3 pl-8 text-sm font-semibold">
            <Link
              to="/espace-client"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-on-primary transition-colors hover:bg-primary-deep"
            >
              Mon espace client
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-full px-2 text-primary underline hover:no-underline"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={validate} noValidate>
        <div className="mb-6 flex w-fit rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('phone')}
            aria-pressed={mode === 'phone'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              mode === 'phone' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">smartphone</span>
            Téléphone (+225)
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            aria-pressed={mode === 'email'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              mode === 'email' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">mail</span>
            Email
          </button>
        </div>

        {mode === 'phone' ? (
          <div className="mb-5">
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
              Numéro de téléphone
            </label>
            <div
              className={`flex items-center overflow-hidden rounded-xl border bg-white ${
                hasError
                  ? 'border-error ring-2 ring-error/20'
                  : 'border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
              }`}
            >
              <span className="flex items-center gap-1 border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
                🇨🇮 +225
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="07 00 00 00 00"
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className="w-full px-4 py-3 text-sm outline-none"
              />
            </div>
            {hasError && (
              <p id="login-error" role="alert" className="mt-2 flex items-center gap-1 text-sm text-error">
                <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                {errorMsg}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">
              Adresse email
            </label>
            <div
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 ${
                hasError
                  ? 'border-error ring-2 ring-error/20'
                  : 'border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-slate-400" aria-hidden="true">alternate_email</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.ci"
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className="w-full text-sm outline-none"
              />
            </div>
            {hasError && (
              <p id="login-error" role="alert" className="mt-2 flex items-center gap-1 text-sm text-error">
                <span className="material-symbols-outlined text-base" aria-hidden="true">error</span>
                {errorMsg}
              </p>
            )}
          </div>
        )}

        <div className="mb-2">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold">
              Mot de passe
            </label>
            <a href="#" className="text-sm font-medium text-primary hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">lock</span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
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
        </div>

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.99]"
        >
          Se connecter
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-xs font-medium text-slate-500">
          Connexion rapide par WhatsApp
        </span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
        >
          <PhoneIcon />
          WhatsApp
        </button>
        <div className="flex gap-4">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold transition-all hover:border-slate-400 hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
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
          <button
            type="button"
            aria-label="Continuer avec Apple"
            className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-semibold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>

      <p className="mt-10 text-center text-xs text-slate-500 lg:hidden">
        © 2024 ServiGo Côte d&apos;Ivoire. Tous droits réservés.
      </p>
    </motion.div>
    </AuthShell>
  )
}