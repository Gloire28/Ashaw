import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { admin, checking, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!checking && admin) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Administration</h1>
        <p className="login-card__subtitle">Gère tes produits, discussions et réservations.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Identifiant</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="field__error">{error}</p>}
          <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
