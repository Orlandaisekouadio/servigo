// Logotype ServiGo — rendu unique pour toute la marque.
//
// La marque est typographique : pas d'icône. Les écrans qui affichaient une
// pastille Material (`verified` dans l'en-tête, `home_repair_service` sur les
// pages de connexion) divergeaient du pied de page et donnaient l'impression
// d'une seconde identité.
//
// `tone` couvre les deux fonds réellement utilisés : `primary` sur fond clair
// (défaut) et `onDark` sur le panneau vert des pages de connexion. La taille se
// règle par `size` plutôt que par des classes arbitraires, pour que l'en-tête,
// le pied de page et les pages de connexion partagent exactement le même rendu.
import { Link } from 'react-router-dom';

const TONES = {
  // Fond clair : le vert de marque, comme le bouton « Se connecter ».
  primary: 'text-primary',
  // Fond vert foncé : le logotype doit ressortir sans lire comme un lien.
  onDark: 'text-white',
};

// Même échelle que les titres du site : 24px pour l'en-tête, 30px pour les
// grands panneaux. `shrink-0` évite que le logotype soit comprimé dans la
// barre de recherche mobile.
const SIZES = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export default function Logo({ tone = 'primary', size = 'md', className = '', to = '/' }) {
  return (
    <Link
      to={to}
      aria-label="ServiGo — accueil"
      className={`font-display font-extrabold tracking-tight ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      ServiGo
    </Link>
  );
}