import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/conversations/admin/stats').then(({ data }) => setStats(data));
  }, []);

  return (
    <>
      <div className="section-head">
        <h2>Tableau de bord</h2>
      </div>

      {!stats ? (
        <Loader />
      ) : (
        <div className="stats-row">
          <div className="stat">
            <div className="stat__value">{stats.activeProducts}</div>
            <div className="stat__label">Produits actifs</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.activeConversations}</div>
            <div className="stat__label">Conversations actives</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.pendingConversations}</div>
            <div className="stat__label">En attente de réponse</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.todayMessages}</div>
            <div className="stat__label">Messages aujourd'hui</div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
