import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Reveal, Stagger } from '../components/motion'
import { itemVariants } from '../components/variants'

function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

const values = [
  {
    icon: 'verified',
    title: 'Vérifié',
    text: "L'identité et les qualifications de chaque artisan sont contrôlées et affichées sur son profil.",
  },
  {
    icon: 'call',
    title: 'Direct',
    text: "Client et artisan se contactent sans intermédiaire : téléphone ou WhatsApp, sans frais cachés.",
  },
  {
    icon: 'location_city',
    title: 'Ivoirien',
    text: 'Une plateforme pensée pour Abidjan et la Côte d\u2019Ivoire : communes, FCFA, Mobile Money.',
  },
]

const avant = [
  'Un bon artisan reste invisible, noyé parmi les annonces',
  'Un client cherche un professionnel de confiance sans repère',
  "Pas de moyen simple de vérifier une promesse avant de payer",
]

const apres = [
  'Des profils vérifiés, notés et documentés, comparables en un coup d\u2019œil',
  "Des avis authentiques postés par la communauté",
  "Un contact direct pour négocier et payer en toute transparence avec l'artisan",
]

const sujets = [
  "Demande d'information",
  'Devenir artisan partenaire',
  'Partenariat ou presse',
  'Autre',
]

const coordonnees = [
  {
    icon: 'whatsapp',
    label: 'WhatsApp',
    value: '+225 07 00 00 00 00',
    note: 'Réponse rapide en semaine',
  },
  {
    icon: 'call',
    label: 'Téléphone',
    value: '+225 27 22 00 00 00',
    href: 'tel:+2252722000000',
  },
  {
    icon: 'mail',
    label: 'Email',
    value: 'contact@servigo.ci',
    href: 'mailto:contact@servigo.ci',
  },
  {
    icon: 'schedule',
    label: 'Horaires',
    value: 'Lundi – Samedi · 8h – 18h',
  },
  {
    icon: 'location_on',
    label: 'Couverture',
    value: "Abidjan et toute la Côte d'Ivoire",
  },
]

const faq = [
  {
    q: 'Comment contacter un artisan ?',
    a: "Passez par la recherche, ouvrez le profil de l'artisan choisi, puis appelez-le ou écrivez-lui sur WhatsApp : le contact est direct, sans intermédiaire ni formulaire bloquant.",
  },
  {
    q: 'Les profils et les avis sont-ils vérifiés ?',
    a: "Oui : l'identité et les qualifications affichées sont contrôlées pour chaque profil. Cette démonstration présente des artisans fictifs — vérification, avis et coordonnées sont illustratifs, pour montrer l'expérience réelle.",
  },
  {
    q: 'Comment se passe le paiement ?',
    a: "Toujours en direct avec l'artisan, après accord : espèces ou Mobile Money (Orange, MTN, Wave, Moov). ServiGo ne détient jamais vos fonds — aucun séquestre n'est en service dans cette démonstration.",
  },
  {
    q: 'Comment devenir artisan partenaire ?',
    a: (
      <>
        Rendez-vous sur la page{' '}
        <Link to="/devenir-artisan" className="font-medium text-primary underline">
          Devenir artisan
        </Link>
        . La démonstration ne crée pas de vrai compte : elle présente le parcours.
      </>
    ),
  },
  {
    q: 'Dans quelles zones ServiGo intervient-il ?',
    a: 'Le service est pensé pour Abidjan (Cocody, Plateau, Marcory, Yopougon, Koumassi, Bingerville…) et s\u2019étend à toute la Côte d\u2019Ivoire.',
  },
  {
    q: 'Le formulaire de contact fonctionne-t-il ?',
    a: "Dans cette démonstration, le formulaire ne transmet rien : il illustre le parcours. Pour une réponse réelle, appelez-nous ou écrivez-nous via les coordonnées ci-dessus.",
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState([])
  const successRef = useRef(null)
  const summaryRef = useRef(null)

  const toggleFaq = (index) =>
    setOpenFaq((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validateField = (field) => {
    const v = (form[field] ?? '').trim()
    if (field === 'name') return v ? '' : 'Indiquez votre nom.'
    if (field === 'email')
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Indiquez un email valide.'
    if (field === 'subject') return form.subject ? '' : 'Choisissez un sujet.'
    if (field === 'message')
      return v.length >= 10 ? '' : 'Votre message doit contenir au moins 10 caractères.'
    return ''
  }

  // Validation au blur : un champ quitté vide ou invalide est signalé tout de suite.
  const onBlur = (field) => () => {
    const err = validateField(field)
    setErrors((prev) => ({ ...prev, [field]: err || undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    for (const f of ['name', 'email', 'subject', 'message']) {
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
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setSent(false)
  }

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
      errors[field] ? 'border-red-600 focus:border-red-600' : 'border-slate-300 focus:border-primary'
    }`

  const fieldError = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {errors[field]}
      </p>
    ) : null

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <Navbar />
      <main className="flex-grow">
        {/* Héro : la page sert d'à propos ET de contact */}
        <section className="border-b border-outline-variant/30 bg-surface-container-low py-20 md:py-28">
          <div className="mx-auto max-w-[900px] px-4 text-center md:px-8">
            <Reveal>
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold tracking-wide text-primary-deep uppercase">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">groups</span>
                À propos · Contact
              </span>
              <h1 className="mb-5 text-4xl leading-tight font-bold tracking-tight text-on-surface md:text-[56px]">
                La cour de confiance de l&apos;artisanat{' '}
                <span className="text-primary">ivoirien</span>
              </h1>
              <p className="mx-auto max-w-2xl text-[17px] leading-7 text-on-surface-variant md:text-[18px]">
                Qui est ServiGo, pourquoi la plateforme existe, et comment nous joindre — tout au
                même endroit.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/contact#contact"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-deep sm:w-auto"
                >
                  Contactez-nous
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                </Link>
                <Link
                  to="/contact#faq"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 text-[15px] font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary sm:w-auto"
                >
                  Lire la FAQ
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" tabIndex={-1} className="scroll-mt-28 py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal>
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <p className="mb-2 font-semibold tracking-wider text-primary-deep uppercase">
                  Notre mission
                </p>
                <h2 className="mb-5 text-[28px] font-semibold text-on-surface md:text-[48px]">
                  ServiGo existe pour une raison simple : la confiance
                </h2>
                <p className="text-on-surface-variant">
                  Notre métier est de remettre l&apos;artisan au centre du quartier : quelqu&apos;un
                  qu&apos;on connaît, qu&apos;on peut vérifier, appeler et recommander.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <blockquote className="mx-auto mb-14 max-w-3xl rounded-2xl border border-primary/20 bg-primary-soft/40 px-8 py-8 text-center md:px-12">
                <span className="material-symbols-outlined mb-3 text-3xl text-primary" aria-hidden="true">
                  format_quote
                </span>
                <p className="text-lg leading-8 font-semibold text-primary-deep md:text-xl">
                  « ServiGo existe pour que chaque client trouve un artisan vérifié, et que chaque
                  bon artisan vive de son métier. »
                </p>
              </blockquote>
            </Reveal>

            <Stagger className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {values.map((v) => (
                <motion.div
                  key={v.title}
                  variants={itemVariants}
                  className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-raised"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                    <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                      {v.icon}
                    </span>
                  </div>
                  <h3 className="mb-3 text-[20px] font-semibold text-on-surface">{v.title}</h3>
                  <p className="text-on-surface-variant">{v.text}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Pourquoi la plateforme existe */}
        <section className="border-y border-outline-variant/30 bg-surface-container-high py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal>
              <div className="mb-12 max-w-3xl">
                <p className="mb-2 font-semibold tracking-wider text-primary-deep uppercase">
                  Pourquoi ServiGo
                </p>
                <h2 className="mb-5 text-[28px] font-semibold text-on-surface md:text-[48px]">
                  Un marché de l&apos;artisanat en plein essor, sans repères
                </h2>
                <p className="text-on-surface-variant">
                  En Côte d&apos;Ivoire, les bonnes adresses circulent de bouche à oreille. Quand
                  elles manquent, on improvise — et on paie le prix de l&apos;improvisation.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Reveal className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">help</span>
                </div>
                <h3 className="mb-5 text-[20px] font-semibold text-on-surface">Le constat</h3>
                <ul className="space-y-4">
                  {avant.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 text-lg text-slate-400" aria-hidden="true">close</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.1} className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-8 md:p-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">verified_user</span>
                </div>
                <h3 className="mb-5 text-[20px] font-semibold text-primary-deep">
                  Ce que ServiGo change
                </h3>
                <ul className="space-y-4">
                  {apres.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-on-surface">
                      <span className="material-symbols-outlined mt-0.5 text-lg text-primary" aria-hidden="true">check</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Contact : formulaire + infos */}
        <section id="contact" tabIndex={-1} className="scroll-mt-28 py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <Reveal>
              <div className="mb-12 max-w-3xl">
                <p className="mb-2 font-semibold tracking-wider text-primary-deep uppercase">Contact</p>
                <h2 className="mb-5 text-[28px] font-semibold text-on-surface md:text-[48px]">
                  Écrivez-nous, ou appelez-nous
                </h2>
                <p className="text-on-surface-variant">
                  Une question, une idée de partenariat, une envie de rejoindre le réseau ? Nous
                  sommes à votre écoute.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Formulaire */}
              <Reveal className="lg:col-span-7">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-raised md:p-8">
                  {Object.keys(errors).length > 0 && (
                    <div
                      ref={summaryRef}
                      tabIndex={-1}
                      data-error-summary
                      role="alert"
                      className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                      <p className="mb-2 font-bold">Veuillez corriger les champs suivants :</p>
                      <ul className="list-disc space-y-1 pl-5">
                        {errors.name && (
                          <li>
                            <a href="#cb-name" className="font-medium underline">
                              Votre nom
                            </a>
                          </li>
                        )}
                        {errors.email && (
                          <li>
                            <a href="#cb-email" className="font-medium underline">
                              Votre email
                            </a>
                          </li>
                        )}
                        {errors.subject && (
                          <li>
                            <a href="#cb-subject" className="font-medium underline">
                              Le sujet de votre message
                            </a>
                          </li>
                        )}
                        {errors.message && (
                          <li>
                            <a href="#cb-message" className="font-medium underline">
                              Votre message
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div
                    className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-900"
                    role="note"
                  >
                    <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden="true">info</span>
                    <p className="text-xs leading-5">
                      <strong className="font-semibold">Démonstration :</strong> les messages ne
                      sont pas transmis — aucune donnée n&apos;est enregistrée. Pour une réponse
                      réelle, utilisez les coordonnées à droite.
                    </p>
                  </div>

                  {sent ? (
                    <div
                      ref={successRef}
                      tabIndex={-1}
                      role="status"
                      className="rounded-xl border border-primary/20 bg-primary-soft/60 p-6 text-center"
                    >
                      <span className="material-symbols-outlined mb-3 text-4xl text-primary" aria-hidden="true">check_circle</span>
                      <p className="mb-1 text-lg font-bold text-primary-deep">Message bien rempli !</p>
                      <p className="mb-5 text-sm text-on-surface-variant">
                        C&apos;est la fin de la démonstration : rien n&apos;a été envoyé. Pour une vraie
                        réponse, appelez-nous ou écrivez-nous via les coordonnées à côté.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="min-h-12 rounded-full border border-primary/30 bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={submit} noValidate>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label htmlFor="cb-name" className="mb-2 block text-sm font-semibold text-on-surface">
                            Nom complet <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="cb-name"
                            type="text"
                            value={form.name}
                            onChange={set('name')}
                            onBlur={onBlur('name')}
                            placeholder="Ex : Awa Koné"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            className={inputClass('name')}
                          />
                          {fieldError('name')}
                        </div>
                        <div>
                          <label htmlFor="cb-email" className="mb-2 block text-sm font-semibold text-on-surface">
                            Adresse email <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="cb-email"
                            type="email"
                            value={form.email}
                            onChange={set('email')}
                            onBlur={onBlur('email')}
                            placeholder="vous@exemple.ci"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            className={inputClass('email')}
                          />
                          {fieldError('email')}
                        </div>
                      </div>

                      <div className="mt-5">
                        <label htmlFor="cb-subject" className="mb-2 block text-sm font-semibold text-on-surface">
                          Sujet <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                            topic
                          </span>
                          <select
                            id="cb-subject"
                            value={form.subject}
                            onChange={set('subject')}
                            onBlur={onBlur('subject')}
                            aria-invalid={!!errors.subject}
                            aria-describedby={errors.subject ? 'subject-error' : undefined}
                            className={`${inputClass('subject')} appearance-none py-3 pr-10 pl-11`}
                          >
                            <option value="" disabled>
                              Choisissez un sujet...
                            </option>
                            {sujets.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-500" aria-hidden="true">
                            expand_more
                          </span>
                        </div>
                        {fieldError('subject')}
                      </div>

                      <div className="mt-5">
                        <label htmlFor="cb-message" className="mb-2 block text-sm font-semibold text-on-surface">
                          Votre message <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id="cb-message"
                          rows={5}
                          value={form.message}
                          onChange={set('message')}
                          onBlur={onBlur('message')}
                          placeholder="Décrivez votre demande en quelques lignes..."
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? 'message-error' : undefined}
                          className={`${inputClass('message')} resize-y leading-6`}
                        />
                        {fieldError('message')}
                      </div>

                      <button
                        type="submit"
                        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-deep sm:w-auto sm:px-10"
                      >
                        Envoyer le message
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">send</span>
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>

              {/* Infos de contact */}
              <Reveal delay={0.12} className="lg:col-span-5">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-raised md:p-8">
                  <h3 className="mb-6 text-[20px] font-semibold text-on-surface">Nos coordonnées</h3>
                  <ul className="space-y-5">
                    {coordonnees.map((c) => (
                      <li key={c.label} className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {c.icon === 'whatsapp' ? (
                            <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                          ) : (
                            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                              {c.icon}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                            {c.label}
                          </p>
                          {c.href ? (
                            <a
                              href={c.href}
                              className="block text-[15px] font-semibold text-on-surface transition-colors hover:text-primary"
                            >
                              {c.value}
                            </a>
                          ) : (
                            <p className="text-[15px] font-semibold text-on-surface">{c.value}</p>
                          )}
                          {c.note && <p className="text-xs text-on-surface-variant">{c.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-outline-variant/20 pt-4 text-xs text-on-surface-variant">
                    Coordonnées de démonstration, à remplacer par les valeurs réelles.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" tabIndex={-1} className="scroll-mt-28 border-t border-outline-variant/30 bg-surface-container-low py-16 md:py-24">
          <div className="mx-auto max-w-[880px] px-4 md:px-8">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="mb-2 font-semibold tracking-wider text-primary-deep uppercase">
                  Aide
                </p>
                <h2 className="mb-5 text-[28px] font-semibold text-on-surface md:text-[48px]">
                  Questions fréquentes
                </h2>
                <p className="text-on-surface-variant">
                  Les réponses aux questions que l&apos;on nous pose le plus souvent.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-raised">
                {faq.map((item, index) => {
                  const open = openFaq.includes(index)
                  return (
                    <div key={item.q} className={index > 0 ? 'border-t border-outline-variant/20' : ''}>
                      <h3>
                        <button
                          type="button"
                          id={`faq-q-${index}`}
                          onClick={() => toggleFaq(index)}
                          aria-expanded={open}
                          aria-controls={`faq-a-${index}`}
                          className="flex min-h-14 w-full items-center justify-between gap-4 px-6 py-4 text-left text-[15px] font-semibold text-on-surface transition-colors hover:bg-primary-soft/40 focus-visible:bg-primary-soft/40 focus-visible:outline-none"
                        >
                          {item.q}
                          <span
                            className={`material-symbols-outlined shrink-0 text-slate-500 transition-transform duration-200 ${
                              open ? 'rotate-180 text-primary' : ''
                            }`}
                            aria-hidden="true"
                          >
                            expand_more
                          </span>
                        </button>
                      </h3>
                      {open && (
                        <div
                          id={`faq-a-${index}`}
                          role="region"
                          aria-labelledby={`faq-q-${index}`}
                          className="px-6 pb-5 text-[15px] leading-7 text-on-surface-variant"
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Coda : retour à l'action */}
        <section className="relative overflow-hidden bg-primary py-14 md:py-20">
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-fixed-dim/20 blur-3xl" aria-hidden="true"></div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <Reveal>
              <h2 className="mb-4 text-[28px] font-bold text-on-primary md:text-[40px]">
                Prêt à trouver l&apos;artisan qu&apos;il vous faut ?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-[17px] leading-7 text-white">
                Parcourez l&apos;annuaire des artisans vérifiés, ou rejoignez le réseau ServiGo pour
                développer votre activité.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/recherche"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-primary transition-all hover:shadow-floating sm:w-auto"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
                  Trouver un artisan
                </Link>
                <Link
                  to="/devenir-artisan"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">handshake</span>
                  Devenir artisan
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}