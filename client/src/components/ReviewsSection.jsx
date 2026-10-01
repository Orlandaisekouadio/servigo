import Marquee from './ui/Marquee'
import { reviews } from '../data/reviews'
import { Reveal } from './motion'

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

function ReviewCard({ review }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-raised sm:w-[380px]">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 text-[15px] leading-relaxed text-on-surface-variant">
        « {review.message} »
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-outline-variant/20 pt-4">
        <img
          src={review.avatar}
          alt=""
          className="h-11 w-11 rounded-full border border-outline-variant/40 object-cover"
        />
        <div>
          <div className="text-sm font-semibold text-on-surface">{review.name}</div>
          <div className="text-xs text-slate-500">{review.commune}</div>
        </div>
      </figcaption>
    </figure>
  )
}

export default function ReviewsSection() {
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
              Du plombier à l’électricienne, voici ce que retiennent celles et ceux qui ont fait
              appel à un artisan ServiGo — noté 4 à 5 étoiles.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Marquee
            pauseOnHover
            repeat={2}
            className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </Marquee>
        </Reveal>
      </div>
    </section>
  )
}