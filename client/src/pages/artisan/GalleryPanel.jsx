// Panneau « Galerie » — photos de chantiers de l'artisan connecté.
// Liste et suppressions passent par GET/POST/DELETE /api/artisans/me/gallery :
// les photos sont réellement versées sur le serveur et rattachées au profil.
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { getErrorMessage } from '../../lib/api'
import { deleteGalleryPhoto, listMyGallery, uploadGalleryPhoto } from '../../services/artisanService'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:5000'

export default function GalleryPanel() {
  const inputRef = useRef(null)
  const [items, setItems] = useState([])
  const [max, setMax] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listMyGallery()
      .then((res) => {
        if (cancelled) return
        setItems(res?.data ?? [])
        setMax(res?.max ?? 0)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError('')
    for (const file of files) {
      try {
        // Sans titre saisi par l'artisan, on retombe sur le nom du fichier.
        const res = await uploadGalleryPhoto({ file, title: file.name.replace(/\.[^.]+$/, '') })
        if (res?.ok) setItems((list) => [res.data, ...list])
        else setError(res?.message || "L'envoi de la photo a échoué.")
      } catch (err) {
        setError(getErrorMessage(err))
        break
      }
    }
    setBusy(false)
  }

  const remove = async (id) => {
    setError('')
    try {
      const res = await deleteGalleryPhoto(id)
      if (!res?.ok) {
        setError(res?.message || 'Suppression impossible.')
        return
      }
      setItems((list) => list.filter((x) => x._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Galerie des chantiers</CardTitle>
          <CardDescription className="mt-0.5">
            {items.length} {items.length > 1 ? 'réalisations' : 'réalisation'}
            {max ? ` sur ${max} possibles` : ''}
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || (max > 0 && items.length >= max)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add_photo_alternate
          </span>
          {busy ? 'Envoi…' : 'Ajouter des photos'}
        </button>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={addFiles}
          aria-label="Ajouter des photos de chantier"
          tabIndex={-1}
        />

        {error && (
          <p role="alert" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-error">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              error
            </span>
            {error}
          </p>
        )}

        {items.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-surface-container-low p-6 text-center text-sm text-slate-500">
            Aucune photo pour l&apos;instant. Ajoutez vos réalisations : elles apparaîtront sur
            votre profil public.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {items.map((g) => (
              <li
                key={g._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
                  <img
                    src={`${UPLOAD_URL}${g.imageUrl}`}
                    alt={g.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">{g.title}</p>
                    {g.subtitle && (
                      <p className="truncate text-xs font-medium text-slate-600">{g.subtitle}</p>
                    )}
                    {g.text && <p className="mt-1 text-xs leading-5 text-slate-500">{g.text}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(g._id)}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      delete
                    </span>
                    Retirer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Chaque photo est versée sur nos serveurs et rattachée à votre profil. Utilisez des
          photos de vos propres chantiers, sans visage de client ni donnée sensible.
        </p>
      </CardContent>
    </Card>
  )
}