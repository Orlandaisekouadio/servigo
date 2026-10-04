// Artisans — liste, filtres et édition des fiches.
//
// L'écran sert à deux gestes qui n'ont pas les mêmes conséquences :
//
//  - Attester ou masquer une fiche : visible immédiatement sur la recherche et la
//    page d'accueil. D'où la colonne « état », qui montre ce qui est réellement
//    appliqué plutôt que ce qui est coché.
//  - Corriger une fiche : nom, métier, commune, contact, texte. Le nom et la
//    commune sont les valeurs que les autres écrans comparent, une coquille
//    s'y voit tout de suite — ils sont donc éditables, mais pas calculés.
//
// `ratingBase` et `reviewsBase` existent parce que la note affichée mélange les
// avis réellement déposés et un socle historique pour les fiches sans avis. Ce
// socle est un nombre saisi, pas une mesure : l'écran le dit explicitement
// plutôt que de le présenter comme un indicateur.
import { useState } from 'react'
import { useCommunes, useServices } from '../../hooks/useReferentials'
import { listAdminArtisans, updateAdminArtisan } from '../../services/adminService'
import { useListeAdmin } from './useListeAdmin'
import {
  Bouton,
  Champ,
  ChampTexte,
  ChampZone,
  Chargement,
  Entete,
  EtatVide,
  Interrupteur,
  Pagination,
  Recherche,
  Retours,
} from './ui'
import { noteFr } from '../../lib/format'

const STATUTS = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'verified', label: 'Attestées' },
  { value: 'hidden', label: 'Masquées' },
]

export default function PanneauArtisans() {
  const liste = useListeAdmin(listAdminArtisans, { status: 'all' })
  const { valeur: communes } = useCommunes()
  const { valeur: metiers } = useServices()
  const [enEdition, setEnEdition] = useState(null)
  // Le retour d'écriture est porté par le panneau, pas par la fiche : une
  // fiche qui se recharge est remplacée par son squelette de chargement, et un
  // message affiché à l'intérieur disparaîtrait avant d'avoir été lu.
  const [retour, setRetour] = useState({ succes: '', erreur: '' })

  return (
    <>
      <Entete
        titre="Artisans"
        description="Les fiches du site. Attester une fiche la rend visible dans la recherche et la page d'accueil ; la masquer la retire sans rien perdre."
      >
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="filtre-statut">
            Filtrer par état
          </label>
          <select
            id="filtre-statut"
            value={liste.criteres.status}
            onChange={(e) => liste.setFiltre('status', e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Recherche
            id="recherche-artisan"
            valeur={liste.q}
            onChange={liste.setQ}
            placeholder="Nom, métier, zone…"
          />
        </div>
      </Entete>

      <Retours
        succes={retour.succes}
        erreur={retour.erreur || liste.erreur}
        className="mb-4"
      />

      {liste.chargement ? (
        <Chargement />
      ) : liste.lignes.length === 0 ? (
        <EtatVide
          icone="handyman"
          titre="Aucune fiche pour ce filtre"
          corps="Changez de filtre ou effacez la recherche."
        />
      ) : (
        <>
          <div className="space-y-4">
            {liste.lignes.map((artisan) => (
              <Fiche
                key={artisan._id}
                artisan={artisan}
                communes={communes.map((c) => c.name)}
                metiers={metiers}
                ouvert={enEdition === artisan._id}
                onOuvrir={() => setEnEdition(enEdition === artisan._id ? null : artisan._id)}
                onEnregistre={liste.recharger}
                signaler={setRetour}
              />
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              page={liste.page}
              total={liste.total}
              onChange={liste.changerPage}
            />
          </div>
        </>
      )}
    </>
  )
}

function Fiche({ artisan, communes, metiers, ouvert, onOuvrir, onEnregistre, signaler }) {
  const [brouillon, setBrouillon] = useState(null)
  const [enCours, setEnCours] = useState(false)

  // Le brouillon est réinitialisé par `cle` : changer de fiche — ou rouvrir la
  // même après rechargement — repart des valeurs réellement en base, pas de ce
  // qui a été laissé en cours de saisie.
  const cle = `${artisan._id}:${JSON.stringify(artisan.services?.map((s) => s.slug))}:${artisan.verified}:${artisan.hidden}:${artisan.available}`
  const valeurs =
    brouillon && brouillon.cle === cle
      ? brouillon
      : {
          cle,
          name: artisan.name ?? '',
          role: artisan.role ?? '',
          commune: artisan.commune ?? '',
          location: artisan.location ?? '',
          phone: artisan.phone ?? '',
          whatsapp: artisan.whatsapp ?? '',
          bio: artisan.bio ?? '',
          available: Boolean(artisan.available),
          services: (artisan.services ?? []).map((s) => s.slug),
        }

  const set = (champ) => (e) => {
    const valeur = e?.target ? e.target.value : e
    setBrouillon({ ...valeurs, [champ]: valeur, cle })
  }

  const basculerService = (slug) => () => {
    const services = valeurs.services.includes(slug)
      ? valeurs.services.filter((s) => s !== slug)
      : [...valeurs.services, slug]
    setBrouillon({ ...valeurs, services, cle })
  }

  const enregistrer = async () => {
    setEnCours(true)
    signaler({ succes: '', erreur: '' })
    try {
      await updateAdminArtisan(artisan._id, {
        name: valeurs.name.trim(),
        role: valeurs.role.trim(),
        commune: valeurs.commune.trim(),
        location: valeurs.location.trim(),
        phone: valeurs.phone.trim(),
        whatsapp: valeurs.whatsapp.trim(),
        bio: valeurs.bio.trim(),
        available: valeurs.available,
        services: valeurs.services,
      })
      setBrouillon(null)
      signaler({ succes: `Fiche de ${valeurs.name.trim()} enregistrée.`, erreur: '' })
      onEnregistre()
    } catch (err) {
      signaler({ succes: '', erreur: err?.message ?? 'Enregistrement impossible.' })
    } finally {
      setEnCours(false)
    }
  }

  const basculerEtat = async (champ) => {
    const cible = { verified: 'attestée', hidden: 'masquée' }[champ]
    setEnCours(true)
    signaler({ succes: '', erreur: '' })
    try {
      await updateAdminArtisan(artisan._id, { [champ]: !artisan[champ] })
      signaler({
        succes: `Fiche de ${artisan.name} ${artisan[champ] ? 'retirée : ' : ''}${cible}.`,
        erreur: '',
      })
      onEnregistre()
    } catch (err) {
      signaler({ succes: '', erreur: err?.message ?? 'Modification impossible.' })
    } finally {
      setEnCours(false)
    }
  }

  const modifie =
    brouillon?.cle === cle &&
    (brouillon.name !== (artisan.name ?? '') ||
      brouillon.role !== (artisan.role ?? '') ||
      brouillon.commune !== (artisan.commune ?? '') ||
      brouillon.location !== (artisan.location ?? '') ||
      brouillon.phone !== (artisan.phone ?? '') ||
      brouillon.whatsapp !== (artisan.whatsapp ?? '') ||
      brouillon.bio !== (artisan.bio ?? '') ||
      brouillon.available !== Boolean(artisan.available) ||
      brouillon.services.join('|') !==
        (artisan.services ?? []).map((s) => s.slug).join('|'))

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        artisan.hidden ? 'border-amber-300' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-start gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{artisan.name}</h3>
            {artisan.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-deep">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  verified
                </span>
                Attestée
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                En attente
              </span>
            )}
            {artisan.hidden ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Masquée
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            {artisan.role || 'Métier non renseigné'}
            {artisan.commune ? ` · ${artisan.commune}` : ''}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {noteFr(artisan.rating ?? 0, 1)} sur 5 · {artisan.reviewsCount ?? 0} avis ·{' '}
            <span className="font-mono">{artisan.slug}</span>
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Base : {noteFr(artisan.ratingBase ?? 0, 1)} · Avis de base : {artisan.reviewsBase ?? 0}
          </p>
          {artisan.services?.length ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {artisan.services.map((s) => (
                <li
                  key={s.slug}
                  className="rounded-full bg-surface-container-low px-2 py-0.5 text-xs"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <Interrupteur
            libelle={`Attestée : ${artisan.name}`}
            libelleCacher
            actif={Boolean(artisan.verified)}
            onChange={() => {
              void basculerEtat('verified')
            }}
          />
          <Interrupteur
            libelle={`Masquée : ${artisan.name}`}
            libelleCacher
            actif={Boolean(artisan.hidden)}
            onChange={() => {
              void basculerEtat('hidden')
            }}
          />
          <Bouton variante="secondaire" onClick={onOuvrir} aria-expanded={ouvert}>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {ouvert ? 'expand_less' : 'edit'}
            </span>
            {ouvert ? 'Fermer' : 'Modifier'}
          </Bouton>
        </div>
      </div>

      {ouvert ? (
        <div className="border-t border-slate-200 bg-surface-container-lowest p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Champ label="Nom affiché">
              <ChampTexte value={valeurs.name} onChange={set('name')} maxLength={120} />
            </Champ>
            <Champ label="Métier">
              <ChampTexte
                value={valeurs.role}
                onChange={set('role')}
                maxLength={120}
                placeholder="Plombier"
              />
            </Champ>
            <Champ
              label="Commune"
              aide="Reprise telle quelle par la recherche et le tri par zone."
            >
              <select
                value={valeurs.commune}
                onChange={set('commune')}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">Non renseignée</option>
                {communes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Champ>
            <Champ label="Zone d'intervention" aide="Texte libre, affiché sur la fiche.">
              <ChampTexte value={valeurs.location} onChange={set('location')} maxLength={160} />
            </Champ>
            <Champ label="Téléphone">
              <ChampTexte value={valeurs.phone} onChange={set('phone')} maxLength={20} />
            </Champ>
            <Champ label="WhatsApp">
              <ChampTexte value={valeurs.whatsapp} onChange={set('whatsapp')} maxLength={20} />
            </Champ>
            <Champ label="Présentation" className="md:col-span-2 lg:col-span-3">
              <ChampZone value={valeurs.bio} onChange={set('bio')} rows={4} maxLength={2000} />
            </Champ>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Métiers rattachés</legend>
            {metiers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Catalogue en chargement… Un artisan peut avoir jusqu'à sept métiers.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {metiers.map((m) => (
                  <label
                    key={m.slug}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${
                      valeurs.services.includes(m.slug)
                        ? 'border-primary bg-primary-soft text-primary-deep'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={valeurs.services.includes(m.slug)}
                      onChange={basculerService(m.slug)}
                    />
                    <span
                      className="material-symbols-outlined text-lg"
                      aria-hidden="true"
                    >
                      {valeurs.services.includes(m.slug) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    {m.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div className="mt-4 max-w-sm">
            <Interrupteur
              libelle="Disponible immédiatement"
              aide="Affiche le badge « Disponible » sur la fiche et dans la recherche."
              actif={valeurs.available}
              onChange={() => setBrouillon({ ...valeurs, available: !valeurs.available, cle })}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <Bouton
              variante="secondaire"
              disabled={enCours || !modifie}
              onClick={() => setBrouillon(null)}
            >
              Annuler
            </Bouton>
            <Bouton variante="principal" disabled={enCours || !modifie} onClick={enregistrer}>
              {enCours ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
          </div>
        </div>
      ) : null}
    </article>
  )
}
