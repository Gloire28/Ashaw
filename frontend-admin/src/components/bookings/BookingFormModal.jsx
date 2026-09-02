import { useState } from 'react';
import api from '../../services/api.js';

const BookingFormModal = ({ conversation, products = [], onClose, onSuccess }) => {
  const [clientPseudo, setClientPseudo] = useState(conversation?.clientPseudo || '');
  const [clientAge, setClientAge] = useState(conversation?.clientAge || '');
  const [clientContact, setClientContact] = useState('');
  const [productId, setProductId] = useState(conversation?.product?.id || products[0]?.id || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const product = conversation?.product || products.find((p) => p.id === productId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientPseudo.trim() || !clientAge || !productId || !date || !startTime || !durationHours) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/bookings', {
        conversationId: conversation?.id,
        productId,
        clientPseudo: clientPseudo.trim(),
        clientAge: Number(clientAge),
        clientContact: clientContact.trim() || undefined,
        date,
        startTime,
        durationHours: Number(durationHours),
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de créer la réservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Créer une réservation</h3>
          <button className="modal__close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {product && (
          <p className="field__hint" style={{ marginBottom: 'var(--space-3)' }}>
            Produit : <strong>{product.name}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {!conversation && (
            <div className="field">
              <label htmlFor="productId">Produit</label>
              <select id="productId" value={productId} onChange={(e) => setProductId(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label htmlFor="clientPseudo">Pseudo du client</label>
              <input
                id="clientPseudo"
                value={clientPseudo}
                onChange={(e) => setClientPseudo(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="clientAge">Âge</label>
              <input
                id="clientAge"
                type="number"
                min={13}
                max={120}
                value={clientAge}
                onChange={(e) => setClientAge(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="clientContact">Contact (téléphone / WhatsApp — optionnel)</label>
            <input
              id="clientContact"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="Ex : +228 90 00 00 00"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="startTime">Heure de début</label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="durationHours">Durée (heures)</label>
              <input
                id="durationHours"
                type="number"
                min={0.5}
                step={0.5}
                max={24}
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes (optionnel)</label>
            <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="field__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn--accent" disabled={loading}>
              {loading ? 'Création…' : 'Créer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;
