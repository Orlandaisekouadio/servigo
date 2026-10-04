// Primitives d'interface du back-office.
//
// Un seul jeu de composants pour les six écrans : boutons, champs, tableaux,
// états. Écrire chaque panneau avec ses propres classes produirait le même
// écart de rendu que la carte artisan avait entre la page d'accueil et la
// recherche — l'écart se voit immédiatement quand on passe d'un écran à
// l'autre.
//
// Fichier de composants uniquement (pas de hook exporté) pour la règle oxlint
// `react/only-export-components`.
import { useEffect, useId, useRef } from 'react'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

// --- Boutons ------------------------------------------------------------

const VARIANTES = {
  principal: 'bg-primary text-on-primary hover:bg-primary-deep',
  secondaire: 'border border-slate-300 bg-white text-on-surface hover:bg-surface-container-low',
  discret: 'text-on-surface-variant hover:bg-surface-container-low',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  discretDanger: 'text-red-700 hover:bg-red-50',
}

export function Bouton({ variante = 'secondaire', className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function BoutonIcone({ libelle, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={libelle}
      title={libelle}
      className={cx(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// --- Champs -------------------------------------------------------------

export function Champ({ label, aide, erreur, children, className }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      {label ? <label className="block text-sm font-semibold">{label}</label> : null}
      {children}
      {erreur ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {erreur}
        </p>
      ) : aide ? (
        <p className="text-xs text-on-surface-variant">{aide}</p>
      ) : null}
    </div>
  )
}

const stylesChamp = cx(
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors',
  'focus:border-primary focus:ring-2 focus:ring-primary/20',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
)

export function ChampTexte({ erreur, className, ...props }) {
  return (
    <input
      aria-invalid={Boolean(erreur)}
      className={cx(stylesChamp, erreur ? 'border-red-400' : 'border-slate-300', 'h-12', className)}
      {...props}
    />
  )
}

export function ChampSelect({ erreur, className, children, ...props }) {
  return (
    <select
      aria-invalid={Boolean(erreur)}
      className={cx(
        stylesChamp,
        erreur ? 'border-red-400' : 'border-slate-300',
        'h-12 appearance-none pr-10',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function ChampZone({ erreur, className, ...props }) {
  return (
    <textarea
      aria-invalid={Boolean(erreur)}
      className={cx(stylesChamp, erreur ? 'border-red-400' : 'border-slate-300', className)}
      {...props}
    />
  )
}

/**
 * Interrupteur à deux états.
 *
 * Deux usages, un seul composant :
 *  - dans un formulaire (`libelle` visible), il porte son texte et son aide ;
 *  - dans une cellule de tableau (`libelleCacher`), seul le nom accessible reste,
 *    faute de quoi six interrupteurs sans étiquette donneraient six boutons
 *    nommés « button » au lecteur d'écran.
 */
export function Interrupteur({
  libelle,
  aide,
  actif,
  onChange,
  libelleCacher = false,
  className,
}) {
  const id = useId()
  const interrupteur = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={libelleCacher ? libelle : undefined}
      aria-labelledby={libelleCacher ? undefined : `${id}-texte`}
      onClick={() => onChange(!actif)}
      className={cx(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        actif ? 'bg-primary' : 'bg-slate-300'
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none block h-6 w-6 rounded-full bg-white shadow transition-transform',
          actif ? 'translate-x-6' : 'translate-x-0.5'
        )}
      />
    </button>
  )

  if (libelleCacher) return interrupteur

  return (
    <div className={cx('flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4', className)}>
      <div className="min-w-0">
        <span id={`${id}-texte`} className="block text-sm font-semibold">
          {libelle}
        </span>
        {aide ? <p className="mt-0.5 text-xs text-on-surface-variant">{aide}</p> : null}
      </div>
      {interrupteur}
    </div>
  )
}

// --- Retour d'état ------------------------------------------------------

export function Alerte({ ton = 'info', children, className }) {
  const tons = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    succes: 'border-green-200 bg-green-50 text-green-900',
    erreur: 'border-red-200 bg-red-50 text-red-900',
  }
  return (
    <p
      role={ton === 'erreur' ? 'alert' : 'status'}
      className={cx('flex items-start gap-2 rounded-xl border px-4 py-3 text-sm', tons[ton], className)}
    >
      {children}
    </p>
  )
}

export function EtatVide({ icone = 'inbox', titre, corps }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
      <span className="material-symbols-outlined mb-3 block text-4xl text-slate-300" aria-hidden="true">
        {icone}
      </span>
      <p className="font-semibold">{titre}</p>
      {corps ? <p className="mt-1 text-sm text-on-surface-variant">{corps}</p> : null}
    </div>
  )
}

export function Chargement({ lignes = 3 }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  )
}

// --- Recherche ----------------------------------------------------------

/**
 * Champ de recherche d'une liste.
 *
 * La saisie est remontée telle quelle : c'est l'appelant qui décide quand lire
 * (le hook `useListeAdmin` attend 300 ms). Aucun filtrage local ici, sinon la
 * listeJiierung aurait deux régimes — une page filtrée par l'API et une page
 * filtrée dans le navigateur — et l'affichage mentirait sur le nombre de
 * résultats.
 */
export function Recherche({ id, valeur, onChange, placeholder, className }) {
  return (
    <div className={cx('relative', className)}>
      <span
        className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      >
        search
      </span>
      <input
        id={id}
        type="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

/**
 * Retour d'une écriture : une seule ligne announcing le résultat, succès ou
 * refus de l'API. Le message d'erreur est celui qu'a formulé l'API — « un
 * chevalet ne peut pas être supprimé tant qu'il a des œuvres » vaut mieux
 * qu'un « une erreur est survenue ».
 */
export function Retours({ succes = '', erreur = '', className }) {
  if (!succes && !erreur) return null
  return (
    <Alerte ton={erreur ? 'erreur' : 'succes'} className={className}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {erreur ? 'error' : 'check_circle'}
      </span>
      {erreur || succes}
    </Alerte>
  )
}

// --- Tableaux -----------------------------------------------------------

export function Tableau({ entetes, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-surface-container-low">
          <tr>
            {entetes.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-xs font-bold tracking-wider text-on-surface-variant uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, total, taille = 20, onChange }) {
  const pages = Math.max(1, Math.ceil((total ?? 0) / taille))
  if (pages <= 1) {
    return total > 0 ? (
      <p className="text-sm text-on-surface-variant">{total} résultat{total > 1 ? 's' : ''}</p>
    ) : null
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-on-surface-variant">
        Page {page} sur {pages} — {total} résultat{total > 1 ? 's' : ''}
      </p>
      <div className="flex gap-2">
        <Bouton variante="secondaire" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Précédent
        </Bouton>
        <Bouton variante="secondaire" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Suivant
        </Bouton>
      </div>
    </div>
  )
}

// --- Boîte de confirmation ----------------------------------------------

/**
 * Confirmation avant une action irréversible (suppression).
 *
 * `window.confirm` n'est pas utilisé : il bloque le thread, son texte n'est pas
 * traduisible de façon fiable et il n'est pas stylable — il casserait la
 * cohérence visuelle du back-office.
 */
export function Confirmation({
  ouvert,
  titre,
  corps,
  libelleConfirmer = 'Supprimer',
  onConfirmer,
  onAnnuler,
  enCours,
}) {
  const refs = useRef({})
  const titreId = useId()

  // Échap annule, sauf pendant l'écriture : annuler une suppression déjà partie
  // laisserait l'interface dans un état qui ne correspond plus à la base.
  useEffect(() => {
    if (!ouvert) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && !enCours) onAnnuler()
    }
    document.addEventListener('keydown', onKey)
    refs.current.confirmer?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [ouvert, enCours, onAnnuler])

  if (!ouvert) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={enCours ? undefined : onAnnuler}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id={titreId} className="text-lg font-bold">
          {titre}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{corps}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Bouton variante="secondaire" onClick={onAnnuler} disabled={enCours}>
            Annuler
          </Bouton>
          <Bouton
            variante="danger"
            ref={(el) => {
              refs.current.confirmer = el
            }}
            onClick={onConfirmer}
            disabled={enCours}
          >
            {enCours ? 'Suppression…' : libelleConfirmer}
          </Bouton>
        </div>
      </div>
    </div>
  )
}

// --- Bandeau de section -------------------------------------------------

export function Entete({ titre, description, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{titre}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}
