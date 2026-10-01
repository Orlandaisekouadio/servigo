import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchCommune } from '../../data/search'

export const ease = [0.22, 1, 0.36, 1]

export function useHeroSearch() {
  const navigate = useNavigate()
  const [service, setService] = useState('')
  const [lieu, setLieu] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    let q = service.trim()
    const commune = matchCommune(lieu)
    if (commune) params.set('commune', commune)
    else if (lieu.trim()) q = `${q} ${lieu.trim()}`.trim()
    if (q) params.set('q', q)
    navigate(`/recherche${params.toString() ? `?${params.toString()}` : ''}`)
  }
  return { service, setService, lieu, setLieu, submit }
}
