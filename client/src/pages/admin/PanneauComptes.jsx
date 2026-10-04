// Comptes — rôles, coordonnées et réinitialisation de mot de passe.
//
// L'écran ne montre pas de mot de passe et n'en demande jamais : le seul moyen
// de le remettre en circulation est d'envoyer le lien de réinitialisation, que
// la personne clique elle-même. Le champ est donc single-use — l'API invalide
// les liens précédents — et le serveur répond « envoyé » ou « déjà fait ».
//
// Le rôle est la seule chose réellement sensible ici. Deux garde-fous tiennent
// côté serveur : un administrateur ne peut pas retirer son propre rôle (ce qui
// interdirait aussi au dernier administrateur de se retirer lui-même), et un
// client ne peut pas être promu sans effet de bord visible. L'écran reflète la
// première règle en bloquant le sélecteur sur sa propre ligne.
import { useState } from 'react'
import { useCommunes } from '../../hooks/useReferentials'
import { listAdminUsers, sendUserReset, updateAdminUser } from '../../services/adminService'
import { useListeAdmin } from './useListeAdmin'
import {
  Bouton,
  BoutonIcone,
  Champ,
  ChampSelect,
  ChampTexte,
  Chargement,
  Confirmation,
  Entete,
  EtatVide,
  Pagination,
  Recherche,
  Retours,
} from './ui'
import { useAuth } from '../../auth/useAuth'

const ROLES = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'client', label: 'Client' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'admin', label: 'Administrateur' },
]

const ROLES_EDITABLES = [
  { value: 'client', label: 'Client' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'admin', label: 'Administrateur' },
]

export default function PanneauComptes() {
  const { user: moi } = useAuth()
  const liste = useListeAdmin(listAdminUsers, { role: 'all' })
  const { valeur: communes } = useCommunes()
  const [modifie, setModifie] = useState(null)

  return (
    <>
      <Entete
        titre="Comptes"
        description="Les comptes des trois rôles : clients, artisans et administrateurs. Le rôle conditionne ce que chaque personne peut faire sur le site."
      >
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="filtre-role">
            Filtrer par rôle
          </label>
          <select
            id="filtre-role"
            value={liste.criteres.role}
            onChange={(e) => liste.setFiltre('role', e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Recherche
            id="recherche-compte"
            valeur={liste.q}
            onChange={liste.setQ}
            placeholder="Nom, email, téléphone…"
          />
        </div>
      </Entete>

      <Retours erreur={liste.erreur} className="mb-4" />

      {liste.chargement ? (
        <Chargement />
      ) : liste.lignes.length === 0 ? (
        <EtatVide
          icone="group"
          titre="Aucun compte pour ce filtre"
          corps="Changez de filtre ou effacez la recherche."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {liste.lignes.map((compte) => (
              <Compte
                key={compte._id}
                compte={compte}
                communes={communes.map((c) => c.name)}
                estMoi={compte._id === moi?.id}
                ouvert={modifie === compte._id}
                onOuvrir={() => setModifie(modifie === compte._id ? null : compte._id)}
                onEnregistre={liste.recharger}
              />
            ))}
          </ul>
          <div className="mt-6">
            <Pagination page={liste.page} total={liste.total} onChange={liste.changerPage} />
          </div>
        </>
      )}
    </>
  )
}

function Compte({ compte, communes, estMoi, ouvert, onOuvrir, onEnregistre }) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [fait, setFait] = useState('')
  const [confirmeReset, setConfirmeReset] = useState(false)
  const [brouillon, setBrouillon] = useState(null)

  // Le brouillon repart de la base à chaque ouverture : un compte modifié puis
  // refermé ne doit pas rouvrir avec des valeurs qui n'existent plus.
  const cle = `${compte._id}:${compte.role}:${compte.name}:${compte.email}:${compte.phone}:${compte.commune ?? ''}`
  const valeurs =
    brouillon?.cle === cle
      ? brouillon
      : {
          cle,
          role: compte.role,
          name: compte.name ?? '',
          email: compte.email ?? '',
          phone: compte.phone ?? '',
          commune: compte.commune ?? '',
        }

  const set = (champ) => (e) =>
    setBrouillon({ ...valeurs, [champ]: e.target.value, cle })

  const enregistrer = async () => {
    setEnCours(true)
    setErreur('')
    setFait('')
    try {
      await updateAdminUser(compte._id, {
        role: valeurs.role,
        name: valeurs.name.trim(),
        email: valeurs.email.trim(),
        phone: valeurs.phone.trim(),
        commune: valeurs.commune.trim(),
      })
      setBrouillon(null)
      setFait('Compte mis à jour.')
      onEnregistre()
    } catch (err) {
      setErreur(err?.message ?? 'Enregistrement impossible.')
    } finally {
      setEnCours(false)
    }
  }

  const envoyerLien = async () => {
    setEnCours(true)
    setErreur('')
    setFait('')
    try {
      const res = await sendUserReset(compte._id)
      setFait(
        res?.message ?? 'Lien de réinitialisation envoyé par email. Valable une seule fois.'
      )
    } catch (err) {
      setErreur(err?.message ?? 'Envoi impossible.')
    } finally {
      setEnCours(false)
      setConfirmeReset(false)
    }
  }

  const modifie =
    brouillon?.cle === cle &&
    (brouillon.role !== compte.role ||
      brouillon.name !== (compte.name ?? '') ||
      brouillon.email !== (compte.email ?? '') ||
      brouillon.phone !== (compte.phone ?? '') ||
      brouillon.commune !== (compte.commune ?? ''))

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{compte.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                compte.role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : compte.role === 'artisan'
                    ? 'bg-primary-soft text-primary-deep'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              {ROLES_EDITABLES.find((r) => r.value === compte.role)?.label ?? compte.role}
            </span>
            {estMoi ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Vous
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            {compte.email ?? 'Aucun email'}
            {compte.phone ? ` · ${compte.phone}` : ''}
            {compte.commune ? ` · ${compte.commune}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Inscrit le {new Date(compte.createdAt).toLocaleDateString('fr-FR')}
            {compte.profile
              ? compte.profile.verified
                ? ' · fiche attestée'
                : ' · fiche en attente de validation'
              : ' · sans fiche artisan'}
            {compte.profile?.hidden ? ' · fiche masquée' : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BoutonIcone
            libelle={`Envoyer un lien de réinitialisation à ${compte.name}`}
            onClick={() => setConfirmeReset(true)}
            disabled={enCours}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              mail
            </span>
          </BoutonIcone>
          <Bouton variante="secondaire" onClick={onOuvrir} aria-expanded={ouvert}>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {ouvert ? 'expand_less' : 'edit'}
            </span>
            {ouvert ? 'Fermer' : 'Modifier'}
          </Bouton>
        </div>
      </div>

      {ouvert ? (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Champ
              label="Rôle"
              aide={
                estMoi
                  ? "Votre propre rôle : l'API refuse de vous le retirer, ce qui protège aussi le dernier administrateur."
                  : undefined
              }
            >
              <ChampSelect
                value={valeurs.role}
                onChange={set('role')}
                disabled={estMoi}
                aria-label={`Rôle de ${compte.name}`}
              >
                {ROLES_EDITABLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </ChampSelect>
            </Champ>
            <Champ label="Nom">
              <ChampTexte value={valeurs.name} onChange={set('name')} maxLength={120} />
            </Champ>
            <Champ
              label="Email"
              aide="Sert d'identifiant de connexion et de destinataire des liens de réinitialisation."
            >
              <ChampTexte
                type="email"
                value={valeurs.email}
                onChange={set('email')}
                maxLength={120}
              />
            </Champ>
            <Champ label="Téléphone" aide="10 chiffres commençant par 0.">
              <ChampTexte
                value={valeurs.phone}
                onChange={set('phone')}
                inputMode="numeric"
                maxLength={10}
              />
            </Champ>
            <Champ label="Commune">
              <ChampSelect
                value={valeurs.commune}
                onChange={set('commune')}
                aria-label={`Commune de ${compte.name}`}
              >
                <option value="">Non renseignée</option>
                {communes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </ChampSelect>
            </Champ>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <Retours succes={fait} erreur={erreur} className="mr-auto" />
            <Bouton variante="secondaire" disabled={enCours || !modifie} onClick={() => setBrouillon(null)}>
              Annuler
            </Bouton>
            <Bouton variante="principal" disabled={enCours || !modifie} onClick={enregistrer}>
              {enCours ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
          </div>
        </div>
      ) : null}

      <Confirmation
        ouvert={confirmeReset}
        titre={`Envoyer un lien à ${compte.name} ?`}
        corps="Un lien de réinitialisation est envoyé par email. Le mot de passe actuel n'est pas changé, et tout lien précédent devient invalide. Sans email sur le compte, l'envoi est refusé par le serveur."
        libelleConfirmer="Envoyer le lien"
        onConfirmer={envoyerLien}
        onAnnuler={() => setConfirmeReset(false)}
        enCours={enCours}
      />
    </article>
  )
}
