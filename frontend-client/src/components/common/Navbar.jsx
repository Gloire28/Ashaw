import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useProductAuth } from '../../context/ProductAuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, logout } = useProductAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand" onClick={closeMenu}>
          MatchMaker
        </NavLink>

        {/* Bouton Hamburger visible uniquement sur mobile */}
        <button
          className="nav__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className={`nav__burger ${isOpen ? 'is-open' : ''}`} />
        </button>

        <nav className={`nav__links ${isOpen ? 'is-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Accueil
          </NavLink>
          <NavLink
            to="/boutique"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Place
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                S'inscrire
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Se connecter
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Tableau de bord
              </NavLink>
              <button onClick={handleLogout} className="btn btn--ghost btn--sm">
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