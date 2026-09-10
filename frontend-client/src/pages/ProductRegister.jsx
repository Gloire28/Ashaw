import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';
import api from '../services/api.js';

const ProductRegister = () => {
  const navigate = useNavigate();
  const { register } = useProductAuth();

  const [form, setForm] = useState({
    username: '',
    password: '',
    age: '',
    quartier: '',
    productName: '',
    description: '',
    category: 'F',
    pricePerHour: '',
    mainPhoto: null,
    additionalPhotos: [],
    video: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'mainPhoto') {
        setForm({ ...form, mainPhoto: files[0] });
      } else if (name === 'additionalPhotos') {
        setForm({ ...form, additionalPhotos: Array.from(files) });
      } else if (name === 'video') {
        setForm({ ...form, video: files[0] });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('password', form.password);
      formData.append('age', form.age);
      formData.append('quartier', form.quartier);
      formData.append('product[name]', form.productName);
      formData.append('product[description]', form.description);
      formData.append('product[category]', form.category);
      formData.append('product[pricePerHour]', form.pricePerHour);
      
      if (form.mainPhoto) formData.append('product[mainPhoto]', form.mainPhoto);
      form.additionalPhotos.forEach((file) => {
        formData.append('product[additionalPhotos]', file);
      });
      if (form.video) formData.append('product[video]', form.video);

      const response = await api.post('/api/product-auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { token, owner, product } = response.data;
      register(token, owner, product);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-6)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          Créer mon Profil
        </h1>

        <form onSubmit={handleSubmit}>
          {error && <div className="banner">{error}</div>}

          <fieldset style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', background: 'var(--surface)' }}>
            <legend style={{ padding: '0 var(--space-2)', fontWeight: 600, color: 'var(--ink)' }}>
              Informations personnelles
            </legend>
            
            <div className="field">
              <label htmlFor="reg-username">Pseudo *</label>
              <input type="text" id="reg-username" name="username" value={form.username} onChange={handleChange} required minLength="3" />
            </div>
            
            <div className="field">
              <label htmlFor="reg-password">Mot de passe *</label>
              <input type="password" id="reg-password" name="password" value={form.password} onChange={handleChange} required minLength="6" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <div className="field">
                <label htmlFor="reg-age">Âge *</label>
                <input type="number" id="reg-age" name="age" value={form.age} onChange={handleChange} required min="13" max="120" />
              </div>
              <div className="field">
                <label htmlFor="reg-quartier">Quartier *</label>
                <input type="text" id="reg-quartier" name="quartier" value={form.quartier} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', background: 'var(--surface)' }}>
            <legend style={{ padding: '0 var(--space-2)', fontWeight: 600, color: 'var(--ink)' }}>
              Mon Profil
            </legend>

            <div className="field">
              <label htmlFor="reg-productName">Nom du Profil *</label>
              <input type="text" id="reg-productName" name="productName" value={form.productName} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="reg-description">Description (Numero de telephone et Taille (M,L,S,XL...) Ajouter une descrition de votre personalité ce sont les informatiosn qui permettent à l'admin de vous mettre en relation) *</label>
              <textarea id="reg-description" name="description" value={form.description} onChange={handleChange} required rows="3" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <div className="field">
                <label>Catégorie *</label>
                <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'calc(var(--space-1) + 2px)' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', cursor: 'pointer' }}>
                    <input type="radio" name="category" value="F" checked={form.category === 'F'} onChange={handleChange} /> F
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', cursor: 'pointer' }}>
                    <input type="radio" name="category" value="N" checked={form.category === 'N'} onChange={handleChange} /> M
                  </label>
                </div>
              </div>

              <div className="field">
                <label htmlFor="reg-pricePerHour">Prix par heure *</label>
                <input type="number" id="reg-pricePerHour" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} required step="0.01" min="0" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-mainPhoto">Photo principale *</label>
              <input type="file" id="reg-mainPhoto" name="mainPhoto" accept="image/*" onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="reg-additionalPhotos">Photos supplémentaires (max 8)</label>
              <input type="file" id="reg-additionalPhotos" name="additionalPhotos" accept="image/*" multiple onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="reg-video">Vidéo (optionnelle)</label>
              <input type="file" id="reg-video" name="video" accept="video/*" onChange={handleChange} />
            </div>
          </fieldset>

          <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: 'var(--accent-ink)', fontWeight: 500 }}>
              Connecte-toi ici
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProductRegister;