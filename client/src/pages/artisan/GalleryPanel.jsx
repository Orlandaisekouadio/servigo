// Panneau « Galerie » — chantiers récents (données du site) + ajout de photos
// en mémoire de session (démo).
import { useRef, useState } from 'react'
import { koffiProfile } from '../../data/search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function GalleryPanel() {
  const inputRef = useRef(null)
  const [added, setAdded] = useState([])

  const addFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const next = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    setAdded((list) => [...list, ...next])
    e.target.value = ''
  }

  const remove = (id) => setAdded((list) => list.filter((x) => x.id !== id))

  const total = koffiProfile.gallery.length + added.length

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Galerie des chantiers</CardTitle>
          <CardDescription className="mt-0.5">
            {total} {total > 1 ? 'réalisations' : 'réalisation'}
            {added.length > 0
              ? ` (dont ${added.length} ajoutée${added.length > 1 ? 's' : ''} en session)`
              : ''}
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-deep"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add_photo_alternate
          </span>
          Ajouter des photos
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

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {koffiProfile.gallery.map((g) => (
            <li
              key={g.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                <span className="material-symbols-outlined" aria-hidden="true">
                  electrical_services
                </span>
              </span>
              <div>
                <p className="text-sm font-bold text-on-surface">{g.title}</p>
                <p className="text-sm font-semibold text-slate-700">{g.subtitle}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{g.text}</p>
              </div>
            </li>
          ))}

          {added.map((img) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
                <img src={img.url} alt={`Photo ajoutée : ${img.name}`} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="truncate text-sm font-semibold text-on-surface">{img.name}</p>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    delete
                  </span>
                  Retirer (démo)
                </button>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-slate-500">
          Les chantiers ci-dessus reprennent la galerie du profil public (photos
          d&apos;illustration). Les photos ajoutées ici restent locales et disparaissent au
          rechargement (démo).
        </p>
      </CardContent>
    </Card>
  )
}