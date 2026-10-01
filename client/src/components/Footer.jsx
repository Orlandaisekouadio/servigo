import { useState } from 'react'
import { Link } from 'react-router-dom'

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const footerLinks = [
  {
    title: 'Services',
    links: [
      { label: 'Plomberie', to: '/recherche?metier=Plomberie%20sanitaire' },
      { label: 'Électricité', to: '/recherche?metier=%C3%89lectricit%C3%A9%20%26%20C%C3%A2blage' },
      { label: 'Menuiserie', to: '/recherche?metier=Menuiserie%20%26%20Bois' },
      { label: 'Peinture', to: '/recherche?metier=Peinture%20%26%20Finition' },
    ],
  },
  {
    title: 'À propos',
    links: [
      { label: 'Notre mission', to: '/contact#mission' },
      { label: 'Blog' },
      { label: 'Carrières' },
      { label: 'Contact', to: '/contact' },
      { label: 'Préloader', to: '/preloaders' },
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'Devenir artisan', to: '/devenir-artisan' },
      { label: "Centre d'aide", to: '/contact#faq' },
      { label: 'Témoignages' },
      { label: 'Légal' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales' },
      { label: 'Confidentialité' },
      { label: 'Conditions Générales' },
      { label: 'Cookies' },
    ],
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState({ status: 'idle', message: '' })
  const subscribe = (e) => {
    e.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setNewsletter({
        status: 'error',
        message: 'Adresse email invalide. Vérifiez et réessayez.',
      })
      return
    }
    setNewsletter({
      status: 'success',
      message: 'Merci ! Vous êtes bien inscrit à la newsletter.',
    })
    setEmail('')
  }
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-4">
            <div>
              <div className="mb-4 text-2xl font-extrabold tracking-tight text-primary-deep">
                ServiGo
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-600">
                La plateforme de confiance pour trouver les meilleurs artisans qualifiés en Côte
                d&apos;Ivoire.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-on-surface uppercase">
                Newsletter
              </h3>
              <p className="text-xs text-slate-500">Recevez nos conseils et offres exclusives.</p>
              {newsletter.status === 'success' ? (
                <p role="status" className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-4 py-2.5 text-sm font-medium text-primary-deep">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
                  {newsletter.message}
                </p>
              ) : (
                <form className="gap-2" onSubmit={subscribe} noValidate>
                  <div className="flex gap-2 max-[374px]:flex-col">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-label="Votre adresse email"
                      aria-invalid={newsletter.status === 'error'}
                      aria-describedby={newsletter.status === 'error' ? 'newsletter-error' : undefined}
                      placeholder="Votre email"
                      className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none max-[374px]:w-full"
                    />
                    <button
                      type="submit"
                      className="min-h-12 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all hover:opacity-90 max-[374px]:w-full"
                    >
                      S&apos;abonner
                    </button>
                  </div>
                  {newsletter.status === 'error' && (
                    <p id="newsletter-error" role="alert" className="mt-2 text-xs font-medium text-red-600">
                      {newsletter.message}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:col-span-8">
            {footerLinks.map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className="text-sm font-bold tracking-wider text-on-surface uppercase">
                  {col.title}
                </h3>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="inline-flex min-h-11 items-center text-sm text-slate-500 transition-colors hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="inline-flex min-h-11 items-center text-sm text-slate-500">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 md:flex-row">
          <div className="text-center text-sm text-slate-500 md:text-left">
            <p>© 2026 ServiGo. Tous droits réservés.</p>
            <p className="mt-1 font-medium text-primary">
              Construit pour l&apos;artisanat ivoirien.
            </p>
          </div>

          <div className="flex items-center gap-4" aria-hidden="true">
            {[{ icon: <FacebookIcon /> }, { icon: <InstagramIcon /> }, { icon: <LinkedinIcon /> }, { icon: <TwitterIcon /> }].map(
              (social, i) => (
                <span
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  {social.icon}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
