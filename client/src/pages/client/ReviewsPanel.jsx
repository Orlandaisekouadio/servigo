// Panneau « Avis laissés » (client) — l'avis public réellement publié par cette
// cliente, suppression en mémoire jusqu'à l'état vide (démo).
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { reviews } from '../../data/reviews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import Stars from '../../components/dashboard/Stars'

const CLIENT_NAME = 'Aïcha Coulibaly'

export default function ReviewsPanel() {
  const [list, setList] = useState(() => reviews.filter((r) => r.name === CLIENT_NAME))

  const remove = (id) => setList((l) => l.filter((r) => r.id !== id))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Avis laissés{' '}
          <span className="text-on-surface-variant font-semibold">
            ({list.length})
          </span>
        </CardTitle>
        <CardDescription className="mt-0.5">
          Les avis de cette cliente proviennent des témoignages publics de la vitrine (démo) :
          modifiables et supprimables en mémoire, jamais envoyés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center md:py-10">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft" aria-hidden="true">
              <span className="material-symbols-outlined text-3xl text-primary">rate_review</span>
            </span>
            <div>
              <p className="text-lg font-bold text-on-surface">Aucun avis laissé pour l&apos;instant</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Après une intervention, vous pourrez noter votre artisan et laisser un retour.
              </p>
            </div>
            <Link
              to="/recherche"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              Retourner à la recherche
            </Link>
          </div>
        ) : (
          <ul className="space-y-0">
            {list.map((r, i) => (
              <li key={r.id}>
                {i > 0 && <Separator className="my-4" />}
                <article>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Stars rating={r.rating} />
                      <span className="text-sm font-medium text-on-surface-variant">
                        {r.commune} · Intervention ServiGo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        delete
                      </span>
                      Supprimer (démo)
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">« {r.message} »</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Publié au nom de {r.name} · Témoignage de la section avis du site.
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}