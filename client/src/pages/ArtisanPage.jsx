// Page « Devenir artisan » — avantages de la vitrine pour les artisans puis
// formulaire d'inscription artisan (démo : aucun compte créé, tout en mémoire).
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SignupForm from '../components/SignupForm'
import { Reveal } from '../components/motion'

const avantages = [
  {
    icon: 'storefront',
    title: 'Une vitrine à votre nom',
    text: 'Profil public avec votre métier, votre commune, vos spécialités et des photos de vos réalisations, visible par les clients du site.',
  },
  {
    icon: 'call',
    title: 'Contact direct',
    text: 'Vos coordonnées (téléphone, WhatsApp) sont affichées sur votre profil : les clients vous joignent sans intermédiaire.',
  },
  {
    icon: 'star',
    title: 'Vos avis mis en avant',
    text: 'Les témoignages de vos clients renforcent votre réputation et rassurent les prochains, commune par commune.',
  },
  {
    icon: 'payments',
    title: 'Paiement direct',
    text: 'Vous convenez du prix et du règlement directement avec le client : espèces ou Mobile Money, sans commission affichée.',
  },
]

const etapes = [
  {
    icon: 'person_add',
    title: 'Créez votre profil',
    text: 'Remplissez le formulaire ci-dessous : identité, zone d’intervention et spécialité. Comptez deux minutes.',
  },
  {
    icon: 'handyman',
    title: 'Présentez votre savoir-faire',
    text: 'Décrivez vos prestations et illustrez-les : un profil complet inspire confiance au premier regard.',
  },
  {
    icon: 'trending_up',
    title: 'Développez votre clientèle',
    text: 'Votre profil rejoint la vitrine et la recherche : les clients de votre commune peuvent vous trouver et vous contacter.',
  },
]

export default function ArtisanPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow">
        {/* Héro */}
        <section className="border-b border-outline-variant/30 bg-surface-container-low py-20 md:py-28">
          <div className="mx-auto max-w-[900px] px-4 text-center md:px-8">
            <Reveal>
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tracking-wide text-primary-deep uppercase">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">construction</span>
                Espace artisans
              </span>
              <h1 className="mb-5 text-4xl leading-tight font-bold tracking-tight text-on-surface md:text-5xl">
                Faites-vous connaître de toute <span className="text-primary">Abidjan</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
                Rejoignez la vitrine ServiGo : présentez votre métier, recevez des contacts
                directs et construisez votre réputation, sans intermédiaire.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="#inscription"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep sm:w-auto"
                >
                  Créer mon profil artisan
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                </Link>
                <Link
                  to="/recherche"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary sm:w-auto"
                >
                  Voir les artisans
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-16 md:py-24" aria-labelledby="artisan-avantages">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal>
              <p className="mb-2 text-center text-xs font-bold tracking-widest text-primary uppercase">
                Pourquoi s’inscrire
              </p>
              <h2 id="artisan-avantages" className="mx-auto mb-4 max-w-2xl text-center text-3xl font-bold tracking-tight md:text-4xl">
                Votre savoir-faire mérite d’être vu
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-center text-base text-on-surface-variant">
                ServiGo est une vitrine : elle présente votre travail aux clients qui cherchent
                un artisan de confiance près de chez eux.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {avantages.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.08}>
                  <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-floating">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary" aria-hidden="true">
                      <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                    </span>
                    <h3 className="mb-2 text-lg font-bold">{a.title}</h3>
                    <p className="text-sm leading-6 text-on-surface-variant">{a.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Étapes */}
        <section className="bg-surface-container-low py-16 md:py-24" aria-labelledby="artisan-etapes">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal>
              <p className="mb-2 text-center text-xs font-bold tracking-widest text-primary uppercase">
                Comment ça marche
              </p>
              <h2 id="artisan-etapes" className="mx-auto mb-12 max-w-2xl text-center text-3xl font-bold tracking-tight md:text-4xl">
                En trois étapes simples
              </h2>
            </Reveal>
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {etapes.map((e, i) => (
                <Reveal key={e.title} delay={i * 0.1}>
                  <li className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="absolute top-6 right-6 text-4xl font-extrabold text-primary-soft" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary" aria-hidden="true">
                      <span className="material-symbols-outlined text-2xl">{e.icon}</span>
                    </span>
                    <h3 className="mb-2 text-lg font-bold">{e.title}</h3>
                    <p className="text-sm leading-6 text-on-surface-variant">{e.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Formulaire */}
        <section id="inscription" tabIndex={-1} className="scroll-mt-28 py-16 md:py-24" aria-labelledby="artisan-form-title">
          <div className="mx-auto max-w-[720px] px-4 md:px-8">
            <Reveal>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                <span className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tracking-wide text-primary-deep uppercase">
                  Inscription artisan gratuite
                </span>
                <h2 id="artisan-form-title" className="mb-1 text-3xl font-bold tracking-tight">
                  Créez votre profil artisan
                </h2>
                <p className="mb-8 text-sm text-slate-500">
                  Deux minutes suffisent. Sélectionnez votre spécialité et votre zone
                  d’intervention.
                </p>
                <SignupForm initialType="artisan" showTypeToggle={false} />
                <p className="mt-8 text-center text-sm text-slate-500">
                  Vous cherchez un artisan ?{' '}
                  <Link to="/recherche" className="font-semibold text-primary hover:underline">
                    Trouver un artisan
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
