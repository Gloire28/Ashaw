import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page-state">
    <h2>Page introuvable</h2>
    <p>Cette page n'existe pas.</p>
    <Link to="/" className="btn btn--ghost">
      Retour à l'accueil
    </Link>
  </div>
);

export default NotFound;
