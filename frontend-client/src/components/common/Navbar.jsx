import { NavLink } from 'react-router-dom';

const Navbar = () => (
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
      </nav>
    </div>
  </header>
);

export default Navbar;
