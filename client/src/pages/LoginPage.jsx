import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import AuthShell from '../components/AuthShell'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('phone')
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  // Le paramètre `from` est conservé pour qui enchaîne sur l'inscription : le
  // visiteur qui veut poser un favori n'est pas perdu en changeant de formulaire.
  const [lienInscription] = useState(() => {
    const from = new URLSearchParams(window.location.search).get('from')
    return from && from.startsWith('/') && !from.startsWith('//')
      ? `/inscription?from=${encodeURIComponent(from)}`
      : '/inscription'
  })

  const validate = async (e) => {
    e.preventDefault()
    setHasError(false)
    setErrorMsg('')
    const data = new FormData(e.currentTarget)
    const ident = (mode === 'phone' ? data.get('phone') : data.get('email') || '').trim()
    const password = (data.get('password') || '').toString()
    if (!ident) {
      setErrorMsg(
        mode === 'phone'
          ? 'Indiquez votre numéro de téléphone.'
          : 'Indiquez votre adresse email.',
      )
      setHasError(true)
      return
    }
    if (!password) {
      setErrorMsg('Indiquez votre mot de passe.')
      setHasError(true)
      return
    }
    setLoading(true)
    try {
      const res = await signIn(ident, password)
      if (res?.ok) {
        // `?from=` ramène le visiteur à l'endroit qui l'a envoyé ici — poser un
        // favori en étant déconnecté, par exemple. On n'accepte qu'un chemin
        // interne : une URL complète ferait de la page un relais de redirection.
        const from = new URLSearchParams(window.location.search).get('from')
        const cible = from && from.startsWith('/') && !from.startsWith('//') ? from : null
        if (cible) {
          navigate(cible, { replace: true })
          return
        }
        // Chaque rôle a son écran d'arrivée. Un administrateur envoyé vers
        // l'espace client y aurait immédiatement rencontré « Accès interdit »,
        // avec un message parlant d'un compte artisan : son point d'entrée est
        // le back-office, seule partie du site qui lui soit ouverte.
        const accueil =
          res.user?.role === 'admin'
            ? '/admin'
            : res.user?.role === 'artisan'
              ? '/espace-artisan'
              : '/espace-client'
        navigate(accueil, { replace: true })
        return
      }
      setHasError(true)
      setErrorMsg(res?.message || 'Identifiants invalides.')
    } catch (err) {
      setHasError(true)
      setErrorMsg(err?.message || 'Identifiants invalides.')
    } finally {
      setLoading(false)
    }
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
        <Link
          to={lienInscription}
          className="text-slate-500 transition-colors hover:text-primary"
        >
          Créer un compte
        </Link>
      </div>

      <h2 className="mb-2 text-3xl font-bold tracking-tight">Connexion</h2>
      <p className="mb-8 text-slate-500">Bienvenue sur votre espace personnel ServiGo.</p>

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
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </form>



      <p className="mt-8 text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link to={lienInscription} className="font-semibold text-primary hover:underline">
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