import { useRef, useState } from 'react';
import api from '../../services/api.js';

const ProductFormModal = ({ product, onClose, onSuccess }) => {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || '');
  const [pricePerHour, setPricePerHour] = useState(product?.pricePerHour || '');
  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mainPhotoInput = useRef(null);
  const additionalPhotosInput = useRef(null);
  const videoInput = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim() || !category.trim() || !pricePerHour) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }
    if (!isEdit && !mainPhotoFile) {
      setError('Une photo principale est requise.');
      return;
    }

    const form = new FormData();
    form.append('name', name.trim());
    form.append('description', description.trim());
    form.append('category', category.trim());
    form.append('pricePerHour', pricePerHour);
    if (mainPhotoFile) form.append('mainPhoto', mainPhotoFile);
    additionalPhotoFiles.forEach((file) => form.append('additionalPhotos', file));
    if (videoFile) form.append('video', videoFile);

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/products/${product.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/products', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'enregistrer le produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nom</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Catégorie</label>
              <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pricePerHour">Prix / heure (FCFA)</label>
              <input
                id="pricePerHour"
                type="number"
                min={0}
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Photo principale {isEdit && '(laisser vide pour garder l’actuelle)'}</label>
            <div className="file-drop" onClick={() => mainPhotoInput.current?.click()}>
              {mainPhotoFile ? mainPhotoFile.name : 'Cliquer pour choisir une image'}
              <input
                type="file"
                accept="image/*"
                ref={mainPhotoInput}
                onChange={(e) => setMainPhotoFile(e.target.files?.[0] || null)}
              />
            </div>
            {(mainPhotoFile || product?.mainPhotoUrl) && (
              <div className="file-preview">
                <img
                  src={mainPhotoFile ? URL.createObjectURL(mainPhotoFile) : product.mainPhotoUrl}
                  alt=""
                />
              </div>
            )}
          </div>

          <div className="field">
            <label>Photos supplémentaires {isEdit && '(ajoutées à celles déjà en ligne)'}</label>
            <div className="file-drop" onClick={() => additionalPhotosInput.current?.click()}>
              {additionalPhotoFiles.length > 0
                ? `${additionalPhotoFiles.length} photo(s) sélectionnée(s)`
                : 'Cliquer pour choisir une ou plusieurs images'}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={additionalPhotosInput}
                onChange={(e) => setAdditionalPhotoFiles(Array.from(e.target.files || []))}
              />
            </div>
            {additionalPhotoFiles.length > 0 && (
              <div className="file-preview">
                {additionalPhotoFiles.map((file, i) => (
                  <img key={i} src={URL.createObjectURL(file)} alt="" />
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label>Vidéo {isEdit && '(laisser vide pour garder l’actuelle)'}</label>
            <div className="file-drop" onClick={() => videoInput.current?.click()}>
              {videoFile ? videoFile.name : 'Cliquer pour choisir une vidéo'}
              <input
                type="file"
                accept="video/*"
                ref={videoInput}
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>
            {(videoFile || product?.videoUrl) && (
              <div className="file-preview">
                <video src={videoFile ? URL.createObjectURL(videoFile) : product.videoUrl} muted />
              </div>
            )}
          </div>

          {error && <p className="field__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn--accent" disabled={loading}>
              {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
