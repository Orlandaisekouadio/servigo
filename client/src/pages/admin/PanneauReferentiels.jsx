// Référentiels — métiers et communes.
//
// Ce sont les listes qui alimentent les formulaires publics : l'inscription, la
// recherche et la page d'accueil. Elles sont donc gérées ici plutôt que dans le
// code : un métier ou une commune ajouté ci-dessous apparaît immédiatement dans
// les menus déroulants, sans redéploiement.
//
// Trois règles que l'API applique et que l'écran reflète :
//
//  - Le nom d'un métier est figé : des fiches artisan le référencent par slug.
//    Seules la description et l'activation se modifient après création.
//  - Le nom d'une commune est également figé : il est stocké en clair sur les
//    fiches, et la recherche le compare exactement.
//  - Une référential utilisée par des fiches n'est pas supprimable, seulement
//    désactivable. Le compteur affiché à côté de chaque ligne est ce qui permet
//    de le voir avant de tenter quoi que ce soit — le bouton de suppression est
//    d'ailleurs désactivé dans ce cas, avec l'explication en infobulle.
import { useState } from 'react'
import { assetUrl } from '../../lib/api'
import {
  createCommune,
  createService,
  deleteCommune,
  deleteService,
  listAdminCommunes,
  listAdminServices,
  updateCommune,
  updateService,
} from '../../services/adminService'
import { useEcritureAdmin, useRessourceAdmin } from './useRessourceAdmin'
import {
  Bouton,
  BoutonIcone,
  Champ,
  ChampTexte,
  Chargement,
  Confirmation,
  Entete,
  EtatVide,
  Retours,
  Interrupteur,
  Tableau,
} from './ui'

const ONGLETS = [
  { id: 'metiers', label: 'Métiers', icone: 'handyman' },
  { id: 'communes', label: 'Communes', icone: 'location_city' },
]

export default function PanneauReferentiels() {
  const [onglet, setOnglet] = useState('metiers')
  return (
    <>
      <Entete
        titre="Référentiels"
        description="Les listes qui alimentent les formulaires du site : les métiers, proposés à l'inscription et dans la recherche, et les communes, proposées dans les deux. Une modification est visible immédiatement, sans redéploiement."
      />

      <div role="tablist" aria-label="Référentiels" className="mb-6 flex gap-2">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={`ref-onglet-${o.id}`}
            aria-selected={onglet === o.id}
            aria-controls={`ref-${o.id}`}
            onClick={() => setOnglet(o.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
              onglet === o.id
                ? 'bg-primary text-on-primary'
                : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {o.icone}
            </span>
            {o.label}
          </button>
        ))}
      </div>

      <section
        id={`ref-${onglet}`}
        role="tabpanel"
        aria-labelledby={`ref-onglet-${onglet}`}
        className="focus-visible:outline-none"
      >
        {onglet === 'metiers' ? <TableMetiers /> : <TableCommunes />}
      </section>
    </>
  )
}

// --- Métiers ------------------------------------------------------------

const METIER_VIDE = { name: '', description: '', imageUrl: '', icon: 'handyman' }

const ajouterService = (corps) => createService(corps)
const modifierService = ({ id, corps }) => updateService(id, corps)
const retirerService = ({ id }) => deleteService(id)

function TableMetiers() {
  const { valeur, chargement, erreur: erreurListe, recharger } =
    useRessourceAdmin(listAdminServices)
  const [form, setForm] = useState(METIER_VIDE)
  const [aSupprimer, setASupprimer] = useState(null)
  const creation = useEcritureAdmin(ajouterService)
  const edition = useEcritureAdmin(modifierService)
  const suppression = useEcritureAdmin(retirerService)

  const nomValide = form.name.trim().length >= 2

  const ajouter = async () => {
    setErreurs([])
    const nom = form.name.trim()
    const corps = {
      name: nom,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      icon: form.icon.trim() || 'handyman',
    }
    // L'écriture est déclenchée par le clic, pas par un effet : le retour de
    // l'API est la seule chose qui doive ramener le formulaire à son état initial.
    const ok = await creation.ecrire(corps, `Métier « ${nom} » ajouté au catalogue.`)
    if (ok) {
      setForm(METIER_VIDE)
      recharger()
    }
  }

  const supprimer = async () => {
    const cible = aSupprimer
    const ok = await suppression.ecrire(
      { id: cible._id },
      `Métier « ${cible.name} » retiré du catalogue.`
    )
    setASupprimer(null)
    if (ok) recharger()
  }

  const bascule = async (metier) => {
    await edition.ecrire(
      { id: metier._id, corps: { active: metier.active === false } },
      `Métier « ${metier.name} » ${metier.active === false ? 'activé' : 'désactivé'}.`
    )
    recharger()
  }

  const renommerDescription = async (metier, description) => {
    if (description === (metier.description ?? '')) return
    await edition.ecrire(
      { id: metier._id, corps: { description } },
      `Description de « ${metier.name} » mise à jour.`
    )
    recharger()
  }

  const enCours = creation.enCours || edition.enCours || suppression.enCours

  return (
    <div className="space-y-6">
      <FormulaireMetier
        form={form}
        setForm={setForm}
        erreur={creation.erreur}
        enCours={creation.enCours}
        valide={nomValide}
        onValider={ajouter}
        onAnnuler={() => {
          setForm(METIER_VIDE)
          creation.setErreur('')
        }}
      />

      <Retours
        succes={[creation.succes, edition.succes, suppression.succes].filter(Boolean).at(-1)}
        erreur={erreurListe || edition.erreur || suppression.erreur}
      />

      {chargement || valeur === null ? (
        <Chargement />
      ) : valeur.length === 0 ? (
        <EtatVide
          icone="handyman"
          titre="Aucun métier au catalogue"
          corps="Ajoutez-en un ci-dessus pour qu'il soit proposé à l'inscription et dans la recherche."
        />
      ) : (
        <Tableau entetes={['Métier', 'Visuel', 'Description', 'Fiches', 'Proposé', '']}>
          {valeur.map((m) => (
            <tr key={m._id} className={m.active === false ? 'opacity-60' : undefined}>
              <td>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-on-surface-variant">{m.slug}</p>
              </td>
              <td>
                {m.imageUrl ? (
                  <img
                    src={assetUrl(m.imageUrl)}
                    alt=""
                    className="h-11 w-11 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary-deep"
                    title="Aucune image : l'icône Material est utilisée"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {m.icon || 'handyman'}
                    </span>
                  </span>
                )}
              </td>
              <td className="max-w-xs">
                <ChampTexte
                  key={`${m._id}:${m.description ?? ''}`}
                  defaultValue={m.description ?? ''}
                  disabled={enCours}
                  maxLength={300}
                  aria-label={`Description de ${m.name}`}
                  className="h-11 py-2"
                  onBlur={(e) => {
                    void renommerDescription(m, e.target.value.trim())
                  }}
                />
              </td>
              <td className="text-on-surface-variant">
                {m.artisansCount > 0 ? m.artisansCount : '—'}
              </td>
              <td>
                <Interrupteur
                  libelle={`Proposé dans les listes de ${m.name}`}
                  libelleCacher
                  actif={m.active !== false}
                  onChange={() => {
                    void bascule(m)
                  }}
                />
              </td>
              <td>
                <BoutonIcone
                  libelle={
                    m.artisansCount > 0
                      ? `Suppression impossible : ${m.artisansCount} fiche(s) utilisent ${m.name}`
                      : `Supprimer ${m.name}`
                  }
                  variante="discretDanger"
                  disabled={m.artisansCount > 0 || enCours}
                  onClick={() => setASupprimer(m)}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    delete
                  </span>
                </BoutonIcone>
              </td>
            </tr>
          ))}
        </Tableau>
      )}

      <Confirmation
        ouvert={Boolean(aSupprimer)}
        titre={`Retirer « ${aSupprimer?.name} » du catalogue ?`}
        corps="Le métier disparaîtra des listes déroulantes. Les fiches déjà rattachées ne sont pas modifiées : c'est la désactivation qui laisse le lien intact."
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
        enCours={suppression.enCours}
      />
    </div>
  )
}

function FormulaireMetier({ form, setForm, erreur, enCours, valide, onValider, onAnnuler }) {
  const set = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="mb-1 font-bold">Ajouter un métier</h3>
      <p className="mb-4 text-sm text-on-surface-variant">
        Le nom sera proposé tel quel à l'inscription. Il ne pourra pas être modifié ensuite : les
        fiches artisan s'y rattachent par une clé dérivée.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Champ label="Nom du métier" erreur={erreur}>
          <ChampTexte
            value={form.name}
            onChange={set('name')}
            erreur={erreur}
            placeholder="Plomberie sanitaire"
            maxLength={80}
          />
        </Champ>
        <Champ
          label="Description"
          aide="Phrase courte affichée sur la carte de la page d'accueil."
        >
          <ChampTexte
            value={form.description}
            onChange={set('description')}
            placeholder="Réparation et installation rapide"
            maxLength={300}
          />
        </Champ>
        <Champ
          label="Chemin de l'image"
          aide="Facultatif. Sans image, la carte affiche l'icône ci-contre."
        >
          <ChampTexte
            value={form.imageUrl}
            onChange={set('imageUrl')}
            placeholder="/images/plomberie.jpg"
            maxLength={300}
          />
        </Champ>
        <Champ
          label="Icône de repli"
          aide="Nom Material Symbols, utilisé quand le métier n'a pas d'image."
        >
          <ChampTexte
            value={form.icon}
            onChange={set('icon')}
            placeholder="handyman"
            maxLength={40}
          />
        </Champ>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Bouton variante="discret" onClick={onAnnuler} disabled={enCours}>
          Vider
        </Bouton>
        <Bouton variante="principal" onClick={onValider} disabled={!valide || enCours}>
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            add
          </span>
          {enCours ? 'Ajout…' : 'Ajouter le métier'}
        </Bouton>
      </div>
    </div>
  )
}

// --- Communes -----------------------------------------------------------

const ajouterCommune = (corps) => createCommune(corps)
const modifierCommune = ({ id, corps }) => updateCommune(id, corps)
const retirerCommune = ({ id }) => deleteCommune(id)

function TableCommunes() {
  const { valeur, chargement, erreur: erreurListe, recharger } =
    useRessourceAdmin(listAdminCommunes)
  const [nom, setNom] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)
  const creation = useEcritureAdmin(ajouterCommune)
  const edition = useEcritureAdmin(modifierCommune)
  const suppression = useEcritureAdmin(retirerCommune)

  const ajouter = async () => {
    const nomPropre = nom.trim()
    const ok = await creation.ecrire(
      { name: nomPropre },
      `Commune « ${nomPropre} » ajoutée au catalogue.`
    )
    if (ok) {
      setNom('')
      recharger()
    }
  }

  const supprimer = async () => {
    const cible = aSupprimer
    const ok = await suppression.ecrire(
      { id: cible._id },
      `Commune « ${cible.name} » supprimée.`
    )
    setASupprimer(null)
    if (ok) recharger()
  }

  const basculer = async (commune, champ) => {
    await edition.ecrire(
      { id: commune._id, corps: { [champ]: commune[champ] !== true } },
      `Commune « ${commune.name} » — ${
        champ === 'active'
          ? commune.active === false
            ? 'réactivée'
            : 'désactivée'
          : commune.locked
            ? 'déverrouillée'
            : 'verrouillée'
      }.`
    )
    recharger()
  }

  const ranger = async (commune, position) => {
    if (!Number.isInteger(position) || position === commune.position) return
    await edition.ecrire(
      { id: commune._id, corps: { position } },
      `Ordre d'affichage de « ${commune.name} » mis à jour.`
    )
    recharger()
  }

  const enCours = creation.enCours || edition.enCours || suppression.enCours

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-6">
        <Champ
          label="Nouvelle commune"
          className="min-w-[240px] flex-1"
          erreur={creation.erreur}
          aide="Le nom devient la valeur stockée sur les fiches artisan : il ne pourra pas être renommé."
        >
          <ChampTexte
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            erreur={creation.erreur}
            placeholder="Cocody"
            maxLength={80}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nom.trim().length >= 2) void ajouter()
            }}
          />
        </Champ>
        <Bouton
          variante="principal"
          onClick={ajouter}
          disabled={nom.trim().length < 2 || creation.enCours}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            add
          </span>
          {creation.enCours ? 'Ajout…' : 'Ajouter'}
        </Bouton>
      </div>

      <Retours
        succes={[creation.succes, edition.succes, suppression.succes].filter(Boolean).at(-1)}
        erreur={erreurListe || edition.erreur || suppression.erreur}
      />

      {chargement || valeur === null ? (
        <Chargement />
      ) : valeur.length === 0 ? (
        <EtatVide
          icone="location_city"
          titre="Aucune commune"
          corps="Ajoutez une commune pour qu'elle soit proposée à l'inscription et dans la recherche."
        />
      ) : (
        <Tableau entetes={['Commune', 'Rang', 'Fiches artisan', 'Proposée', 'Verrou', '']}>
          {valeur.map((c) => (
            <tr key={c._id} className={c.active === false ? 'opacity-60' : undefined}>
              <td>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {c.locked
                    ? 'Verrouillée : ne peut plus être supprimée'
                    : 'Nom figé : stocké en clair sur les fiches'}
                </p>
              </td>
              <td>
                <ChampTexte
                  key={`${c._id}:${c.position}`}
                  type="number"
                  defaultValue={c.position}
                  min={0}
                  max={999}
                  disabled={enCours}
                  aria-label={`Rang d'affichage de ${c.name}`}
                  className="h-10 w-24 py-1"
                  onBlur={(e) => {
                    void ranger(c, Number(e.target.value))
                  }}
                />
              </td>
              <td className="text-on-surface-variant">{c.artisansCount > 0 ? c.artisansCount : '—'}</td>
              <td>
                <Interrupteur
                  libelle={`Proposée dans les listes de ${c.name}`}
                  libelleCacher
                  actif={c.active !== false}
                  onChange={() => {
                    void basculer(c, 'active')
                  }}
                />
              </td>
              <td>
                <Interrupteur
                  libelle={`Verrouillée contre la suppression : ${c.name}`}
                  libelleCacher
                  actif={Boolean(c.locked)}
                  onChange={() => {
                    void basculer(c, 'locked')
                  }}
                />
              </td>
              <td>
                <BoutonIcone
                  libelle={
                    c.artisansCount > 0
                      ? `Suppression impossible : ${c.artisansCount} fiche(s) sont rattachées à ${c.name}`
                      : `Supprimer ${c.name}`
                  }
                  variante="discretDanger"
                  disabled={c.artisansCount > 0 || Boolean(c.locked) || enCours}
                  onClick={() => setASupprimer(c)}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    delete
                  </span>
                </BoutonIcone>
              </td>
            </tr>
          ))}
        </Tableau>
      )}

      <Confirmation
        ouvert={Boolean(aSupprimer)}
        titre={`Supprimer « ${aSupprimer?.name} » ?`}
        corps="Si des fiches y sont rattachées, préférez la désactiver : l'API refuse la suppression dans ce cas, précisément pour ne pas les laisser sans commune. Le verrouillage va plus loin et empêche aussi toute suppression."
        onConfirmer={supprimer}
        onAnnuler={() => setASupprimer(null)}
        enCours={suppression.enCours}
      />
    </div>
  )
}
