import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      // 1. Upload des fichiers vers un endpoint temporaire ou directement sur Backblaze.
      // Pour simplifier, on suppose que l'API d'inscription accepte les fichiers en multipart.
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

      // Appel à l'API d'inscription (qui gère l'upload des fichiers)
      const response = await api.post('/api/product-auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Le backend renvoie { token, owner, product }
      const { token, owner, product } = response.data;
      // Stocker le token via le contexte
      register(token, owner, product);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Créer mon compte produit</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <fieldset>
          <legend>Informations personnelles</legend>
          <div className="field">
            <label>Pseudo *</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} required minLength="3" />
          </div>
          <div className="field">
            <label>Mot de passe *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength="6" />
          </div>
          <div className="field">
            <label>Âge *</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} required min="13" max="120" />
          </div>
          <div className="field">
            <label>Quartier *</label>
            <input type="text" name="quartier" value={form.quartier} onChange={handleChange} required />
          </div>
        </fieldset>

        <fieldset>
          <legend>Mon produit</legend>
          <div className="field">
            <label>Nom du produit *</label>
            <input type="text" name="productName" value={form.productName} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows="3" />
          </div>
          <div className="field">
            <label>Catégorie *</label>
            <div className="radio-group">
              <label><input type="radio" name="category" value="F" checked={form.category === 'F'} onChange={handleChange} /> F</label>
              <label><input type="radio" name="category" value="N" checked={form.category === 'N'} onChange={handleChange} /> M</label>
            </div>
          </div>
          <div className="field">
            <label>Prix par heure *</label>
            <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} required step="0.01" min="0" />
          </div>
          <div className="field">
            <label>Photo principale *</label>
            <input type="file" name="mainPhoto" accept="image/*" onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Photos supplémentaires (max 8)</label>
            <input type="file" name="additionalPhotos" accept="image/*" multiple onChange={handleChange} />
          </div>
          <div className="field">
            <label>Vidéo (optionnelle)</label>
            <input type="file" name="video" accept="video/*" onChange={handleChange} />
          </div>
        </fieldset>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn--accent" disabled={loading}>
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
};

export default ProductRegister;