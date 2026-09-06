import { NavLink } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, logout } = useProductAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand">
          Louez
        </NavLink>
        <nav className="nav__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Accueil
          </NavLink>
          <NavLink to="/boutique" className={({ isActive }) => (isActive ? 'active' : '')}>
            Boutique
          </NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>
                S'inscrire
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                Se connecter
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                Tableau de bord
              </NavLink>
              <button onClick={logout} className="btn btn--ghost" style={{ marginLeft: '8px' }}>
                Déconnexion
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;