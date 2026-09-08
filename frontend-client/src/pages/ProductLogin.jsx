import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';

const ProductLogin = () => {
  const navigate = useNavigate();
  const { login } = useProductAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-5)', paddingBottom: 'var(--space-6)' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          Connexion – Portail Profil
        </h1>

        <form onSubmit={handleSubmit}>
          {error && <div className="banner">{error}</div>}

          <div className="field">
            <label htmlFor="login-username">Pseudo</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn--accent btn--block" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent-ink)', fontWeight: 500 }}>
              Inscris-toi ici
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProductLogin;