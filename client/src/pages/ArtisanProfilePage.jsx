import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { koffiProfile } from '../data/search'
import { Reveal } from '../components/motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GalleryBento from '../components/GalleryBento'

const DEMO_PHONE = '+225 07 12 34 56 89'
const DEMO_PHONE_INTL = '+2250712345689'
const DEMO_PHONE_WA = '2250712345689'

function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span
      className="flex items-center gap-0.5 text-[#c2410c]"
      role="img"
      aria-label={`Note ${rating} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-base" aria-hidden="true">
          {i < full || (half && i === full) ? (half && i === full ? 'star_half' : 'star') : 'star'}
        </span>
      ))}
    </span>
  )
}

export default function ArtisanProfilePage() {
  const { slug } = useParams()
  const [revealPhone, setRevealPhone] = useState(false)
  const [form, setForm] = useState({ besoin: '', quartier: '', tel: '' })
  const [devis, setDevis] = useState(null)
  const p = {
    ...koffiProfile,
    slug,
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans text-on-surface antialiased lg:pb-0">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        {/* Bannière de démonstration */}
        <section
          className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
          role="note"
        >
          <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">
            info
          </span>
          <p className="text-sm leading-6">
            <strong className="font-bold">Profil de démonstration.</strong>{' '}
            Cette page illustre la structure d&apos;un profil artisan. Le contenu est fictif :
            aucune mise en relation réelle, aucun avis, aucun chiffre vérifié.
          </p>
        </section>

        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link to="/" className="flex items-center rounded py-3 hover:text-primary">
            Accueil
          </Link>
          <span className="material-symbols-outlined text-base text-slate-300" aria-hidden="true">
            chevron_right
          </span>
          <Link to="/recherche" className="flex items-center rounded py-3 hover:text-primary">
            Trouver un artisan
          </Link>
          <span className="material-symbols-outlined text-base text-slate-300" aria-hidden="true">
            chevron_right
          </span>
          <span className="font-medium text-slate-800">{p.name}</span>
        </nav>

        {/* Hero card */}
        <Reveal>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 md:h-36">
              <img
                src={p.cover}
                alt="Chantier électrique illustrant le métier"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-6 pb-6 md:px-10 md:pb-10">
              <div className="-mt-14 mb-5 flex flex-col items-start gap-4 md:-mt-16 md:flex-row md:items-end">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg md:h-36 md:w-36"
                />
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                    {p.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      bolt
                    </span>
                    {p.role}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        location_on
                      </span>
                      {p.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Stars rating={p.rating} />
                      <span className="text-sm font-semibold text-slate-600">
                        Note illustrée
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        schedule
                      </span>
                      Disponible maintenant (démo)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 max-w-[280px]">
                  <a
                    href="#demande-devis"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      request_quote
                    </span>
                    Demander un devis
                  </a>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Cette action illustre le parcours : aucune demande n&apos;est réellement
                    transmise sur ce profil de démonstration.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* Colonne principale */}
          <div className="order-2 space-y-12 lg:order-1">
            {/* Présentation */}
            <section>
              <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  description
                </span>
                Présentation
              </h2>
              <p className="leading-7 text-slate-600">
                Je suis <strong>{p.name}</strong>, technicien électricien avec plus de 8 années
                d&apos;expérience sur les chantiers résidentiels de standing, les immeubles de
                bureaux et les résidences privées du district d&apos;Abidjan. Diplômé de
                l&apos;Institut National Polytechnique Félix Houphouët-Boigny (INP-HB) et titulaire
                du Certificat d&apos;Aptitude Professionnelle (CAP Électricité Bâtiment),
                j&apos;ai fait de la sécurité des installations et de la rigueur d&apos;exécution
                mes deux exigences absolues. En Côte d&apos;Ivoire, les variations de tension et
                les surtensions du réseau nécessitent des équipements de protection adéquats : je
                conçois et sécurise vos réseaux électriques selon les normes internationales NF C
                15-100. Qu&apos;il s&apos;agisse d&apos;un dépannage urgent, de la réhabilitation
                totale d&apos;un tableau divisionnaire ou de l&apos;installation de dispositifs
                solaires et d&apos;onduleurs, chaque intervention est documentée par un rapport
                technique remis au client.
              </p>
            </section>

            {/* Spécialités */}
            <section>
              <h2 className="font-display mb-5 text-2xl font-bold">Spécialités & Prestations</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {p.services.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {s.icon}
                      </span>
                    </span>
                    <h3 className="font-display mb-2 text-lg font-bold">{s.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-slate-500">{s.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Galerie — photos de chantiers en bento grid */}
            <section>
              <h2 className="font-display mb-1 text-2xl font-bold">Galerie — chantiers récents</h2>
              <p className="mb-5 text-sm text-slate-500">
                Références d&apos;exemple : photos d&apos;illustration (Pexels), aucune
                correspondance garantie avec un chantier réel. Cliquez sur une photo pour
                l&apos;agrandir.
              </p>
              {p.gallery?.length ? (
                <GalleryBento items={p.gallery} />
              ) : (
                <p className="text-sm text-slate-500">Aucune réalisation renseignée.</p>
              )}
            </section>

            {/* Avis — exemples illustratifs */}
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    Avis (exemples illustratifs)
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Retours fictifs rédigés pour montrer la rubrique : aucun n&apos;est réel, ni
                    vérifié, ni lié à une intervention.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {p.reviews.map((r) => (
                  <article
                    key={r.author}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep">
                          {r.author[0]}
                          {r.author[1]}
                        </span>
                        <div>
                          <p className="font-bold">{r.author}</p>
                          <p className="text-xs text-slate-500">{r.location}</p>
                        </div>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{r.text}</p>
                    <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        handyman
                      </span>
                      Prestation : {r.service}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Colonne latérale — contact & devis (remontée sur mobile) */}
          <aside className="order-1 space-y-6 lg:order-2">
            {/* Carte contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                </span>
                <span className="text-sm font-bold text-primary-deep">
                  Disponible maintenant (démo)
                </span>
              </div>
              <h2 className="font-display mb-1 text-xl font-bold">Contacter {p.name}</h2>
              <p className="mb-5 text-sm text-slate-500">
                Numéros illustratifs : les liens s&apos;ouvrent, mais aucune ligne réelle
                n&apos;est derrière ce profil de démonstration.
              </p>

              {revealPhone ? (
                <a
                  href={`tel:${DEMO_PHONE_INTL}`}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    call
                  </span>
                  {DEMO_PHONE}
                </a>
              ) : (
                <button
                  onClick={() => setRevealPhone(true)}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    call
                  </span>
                  Afficher le numéro
                </button>
              )}
              <a
                href={`https://wa.me/${DEMO_PHONE_WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075e54] py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  chat
                </span>
                WhatsApp
              </a>

              <div className="mt-5 rounded-xl bg-primary-soft/60 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-primary-deep">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    info
                  </span>
                  Paiement & garantie (démo)
                </p>
                <p className="text-xs leading-5 text-slate-600">
                  Sur ce profil de démonstration, le paiement se ferait directement avec
                  l&apos;artisan. La garantie séquestre ServiGo n&apos;est pas active ici.
                </p>
              </div>
            </div>

            {/* Demande de devis */}
            <div
              id="demande-devis"
              className="scroll-mt-36 rounded-2xl border border-primary/30 bg-white p-6 shadow-sm"
            >
              <h2 className="font-display mb-1 text-xl font-bold">Demande de devis express</h2>
              <p className="mb-5 text-sm text-slate-500">
                Simulation : aucune demande n&apos;est transmise sur cette démo.
              </p>

              {devis ? (
                <div role="status" className="rounded-xl bg-primary-soft p-5 text-center">
                  <span className="material-symbols-outlined mb-2 inline-block text-4xl text-primary" aria-hidden="true">
                    info
                  </span>
                  <p className="font-bold text-primary-deep">Simulation de démonstration</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Aucune demande n&apos;a été transmise : cette page illustre uniquement le
                    parcours de demande de devis.
                  </p>
                  <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-slate-600">
                    <li>
                      <strong>Besoin :</strong> {devis.besoin}
                    </li>
                    <li>
                      <strong>Quartier :</strong> {devis.quartier}
                    </li>
                    <li>
                      <strong>Contact :</strong> {devis.tel}
                    </li>
                  </ul>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDevis(null)}
                      className="flex-1 rounded-xl border border-primary bg-white py-3 text-sm font-semibold text-primary hover:bg-primary-soft"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ besoin: '', quartier: '', tel: '' })
                        setDevis(null)
                      }}
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-deep"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setDevis(form)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="besoin" className="mb-2 block text-sm font-semibold">
                      Type de besoin
                    </label>
                    <div className="relative">
                      <select
                        id="besoin"
                        name="besoin"
                        required
                        value={form.besoin}
                        onChange={update('besoin')}
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="" disabled>
                          Sélectionnez...
                        </option>
                        <option>Dépannage d&apos;urgence (panne / disjonction)</option>
                        <option>Rénovation ou réfection de tableau</option>
                        <option>Installation onduleur / stabilisateur</option>
                        <option>Autre installation électrique</option>
                      </select>
                      <span
                        className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="quartier" className="mb-2 block text-sm font-semibold">
                      Votre quartier à Abidjan
                    </label>
                    <input
                      id="quartier"
                      name="quartier"
                      type="text"
                      required
                      value={form.quartier}
                      onChange={update('quartier')}
                      placeholder="Ex : Riviera Bonoumin"
                      autoComplete="address-level2"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="tel" className="mb-2 block text-sm font-semibold">
                      Votre numéro de contact
                    </label>
                    <input
                      id="tel"
                      name="tel"
                      type="tel"
                      required
                      value={form.tel}
                      onChange={update('tel')}
                      placeholder="+225 07 ..."
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
                  >
                    Envoyer ma demande à {p.name.split(' ')[0]}
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      send
                    </span>
                  </button>
                  <p className="text-xs leading-5 text-slate-500">
                    Démo : le bouton valide le formulaire localement et n&apos;envoie rien.
                  </p>
                </form>
              )}
            </div>

            {/* Informations pratiques */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display mb-4 text-lg font-bold">
                Informations du profil (démo)
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    school
                  </span>
                  <span>
                    <span className="block font-semibold">Formation</span>
                    <span className="text-slate-500">CAP Élec. — illustratif</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    account_balance_wallet
                  </span>
                  <span>
                    <span className="block font-semibold">Moyens de paiement</span>
                    <span className="text-slate-500">Wave, Orange Money, Espèces</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">
                    receipt_long
                  </span>
                  <span>
                    <span className="block font-semibold">Facture</span>
                    <span className="text-slate-500">Sur demande</span>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Barre d'action mobile persistante */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1200px] gap-3">
          <a
            href={`tel:${DEMO_PHONE_INTL}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-deep"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              call
            </span>
            Appeler
          </a>
          <a
            href="#demande-devis"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary bg-primary-soft py-3 text-sm font-semibold text-primary-deep hover:bg-primary-soft"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              edit_note
            </span>
            Demander un devis
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}