const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Panne réseau ou API injoignable. Le navigateur ne produit qu'un message
// technique en anglais (« Failed to fetch ») : on le remplace une fois pour
// toutes, sinon chaque écran affiche une chaîneanglaise dans une interface
// française.
const RESEAU_ROMPU =
  "Impossible de joindre le serveur. Vérifiez votre connexion, puis réessayez.";

export async function apiRequest(path, { method = 'GET', body, headers = {}, credentials = 'include', signal } = {}) {
  const isJson = body && typeof body === 'object' && !(body instanceof FormData);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials,
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: isJson ? JSON.stringify(body) : body,
      signal,
    });
  } catch (err) {
    // Une annulation volontaire (démontage de page) n'est pas une panne.
    if (err?.name === 'AbortError') throw err;
    throw new Error(RESEAU_ROMPU);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Réponse sans corps JSON : `data` reste null.
  }
  if (!res.ok) {
    const message = data?.message || `Erreur ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}

export function getErrorMessage(err) {
  if (err?.message) return err.message;
  return 'Une erreur est survenue.';
}

const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// Les visuels de profil peuvent venir de deux origines : les fichiers versés par
// l'artisan, servis par l'API sous /uploads, et les visuels de la vitrine servis
// par le front sous /images. On n'ajoute l'origine de l'API que dans le premier cas.
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith('/uploads/') ? `${API_ORIGIN}${path}` : path;
}
