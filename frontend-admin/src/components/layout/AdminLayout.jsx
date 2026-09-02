import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../common/Loader.jsx';

const AdminLayout = () => {
  const { admin, checking, logout } = useAuth();

  if (checking) return <Loader label="Vérification de la session…" />;
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Louez — Admin</div>
        <nav className="admin-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Tableau de bord
          </NavLink>
          <NavLink to="/conversations" className={({ isActive }) => (isActive ? 'active' : '')}>
            Conversations
          </NavLink>
          <NavLink to="/reservations" className={({ isActive }) => (isActive ? 'active' : '')}>
            Réservations
          </NavLink>
          <NavLink to="/produits" className={({ isActive }) => (isActive ? 'active' : '')}>
            Produits
          </NavLink>
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">{admin.username}</div>
          <button className="btn btn--ghost btn--sm btn--block" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
