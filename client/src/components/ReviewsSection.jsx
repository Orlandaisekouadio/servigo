// Bandeau « Avis clients » de l'accueil — les avis affichés sont ceux réellement
// publiés en base (GET /api/reviews/recent), pas une sélection figée dans le
// code. Chaque carte nomme l'artisan concerné pour que le visiteur puisse
// retrouver la fiche et vérifier l'avis.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Marquee from './ui/Marquee'
import { Reveal } from './motion'
import { assetUrl, getErrorMessage } from '../lib/api'
import { listRecentReviews } from '../services/socialService'

function Stars({ rating }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)
  return (
    <div
      className="flex text-amber-400"
      role="img"
      aria-label={`Note ${rating.toFixed(1).replace('.', ',')} sur 5`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className="material-symbols-outlined text-[18px]" aria-hidden="true">
          star
        </span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          star_half
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="material-symbols-outlined text-[18px]" aria-hidden="true">
          star_border
        </span>
      ))}
    </div>
  )
}

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

function ReviewCard({ review }) {
  const artisan = review.artisan
  return (
    <figure className="w-[300px] shrink-0 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-raised sm:w-[380px]">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 text-[15px] leading-relaxed text-on-surface-variant">
        « {review.text} »
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-outline-variant/20 pt-4">
        {artisan?.avatarUrl ? (
          <img
            src={assetUrl(artisan.avatarUrl)}
            alt=""
            loading="lazy"
            className="h-11 w-11 rounded-full border border-outline-variant/40 object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-deep"
          >
            {initials(review.authorName)}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-on-surface">{review.authorName}</div>
          {artisan && (
            <Link
              to={`/artisan/${artisan.slug}`}
              className="block truncate text-xs text-slate-500 transition-colors hover:text-primary hover:underline"
            >
              a fait appel à {artisan.name}
            </Link>
          )}
        </div>
      </figcaption>
    </figure>
  )
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listRecentReviews(6)
      .then((res) => {
        if (!cancelled) setReviews(res?.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loading = reviews == null && !error

  return (
    <section
      id="avis"
      tabIndex={-1}
      className="scroll-mt-28 border-y border-outline-variant/30 bg-surface-container-low py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary-deep uppercase">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                reviews
              </span>
              Avis clients
            </p>
            <h2 className="mb-4 text-[28px] font-semibold text-on-surface md:text-[48px]">
              La preuve par les clients
            </h2>
            <p className="text-on-surface-variant">
              Les avis publiés sur les fiches ServiGo, tels que les clients les ont rédigés
              après leur intervention.
            </p>
          </div>
        </Reveal>

        {error ? (
          <p role="alert" className="mx-auto max-w-md rounded-2xl bg-white/60 p-6 text-center text-sm text-slate-600">
            Les avis ne peuvent pas être chargés pour le moment ({error}).
          </p>
        ) : loading ? (
          <p role="status" className="text-center text-sm text-slate-500">
            Chargement des avis…
          </p>
        ) : reviews.length === 0 ? (
          // Aucun avis en base : la section l'assume plutôt que de prêter des
          // paroles à des clients qui n'ont rien écrit.
          <div className="mx-auto max-w-xl rounded-2xl bg-white/60 p-8 text-center">
            <span className="material-symbols-outlined mb-3 text-4xl text-slate-400" aria-hidden="true">
              rate_review
            </span>
            <p className="font-semibold text-on-surface">Aucun avis publié pour le moment</p>
            <p className="mt-1 text-sm text-slate-600">
              Dès qu&apos;un client laissera son retour sur une fiche artisan, il apparaîtra ici.
            </p>
          </div>
        ) : (
          <Reveal delay={0.1}>
            <Marquee
              pauseOnHover
              repeat={2}
              className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            >
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </Marquee>
          </Reveal>
        )}
      </div>
    </section>
  )
}
