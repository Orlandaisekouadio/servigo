import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import AuthShell from '../components/AuthShell'
import SignupForm from '../components/SignupForm'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()

  return (
    <AuthShell
      badge={
        <>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">verified</span>
          Réseau officiel Abidjan
        </>
      }
      title="L'excellence des métiers manuels à portée de main."
      subtitle="Rejoignez le réseau ServiGo : artisans vérifiés et clients de toute la Côte d'Ivoire."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
      <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tracking-wide text-primary-deep uppercase">
        Inscription rapide et gratuite
      </span>
      <h2 className="mb-1 text-3xl font-bold tracking-tight">Rejoignez ServiGo</h2>
      <p className="mb-8 text-slate-500">
        La plateforme n°1 des artisans certifiés et des services du quotidien en Côte
        d&apos;Ivoire.
      </p>

      <SignupForm
        initialType={searchParams.get('role') === 'artisan' ? 'artisan' : 'client'}
        showTypeToggle
      />

      <p className="mt-8 text-center text-sm text-slate-500">
        Vous avez déjà un compte ?{' '}
        <Link to="/connexion" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>

      <p className="mt-10 text-center text-xs text-slate-500 lg:hidden">
        © 2024 ServiGo Côte d&apos;Ivoire. Tous droits réservés.
      </p>
      </motion.div>
    </AuthShell>
  )
}
