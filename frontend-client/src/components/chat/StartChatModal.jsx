import { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';

const StartChatModal = () => {
  const { startChatProduct, setStartChatProduct, startConversation } = useChat();
  const [pseudo, setPseudo] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!startChatProduct) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const ageNumber = Number(age);
    if (!pseudo.trim()) {
      setError('Choisis un pseudo pour continuer.');
      return;
    }
    if (!Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 120) {
      setError('Indique un âge valide (13 à 120 ans).');
      return;
    }

    setLoading(true);
    try {
      await startConversation({ pseudo: pseudo.trim(), age: ageNumber, productId: startChatProduct.id });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de démarrer la discussion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={() => setStartChatProduct(null)}>
      <div className="start-chat" onClick={(e) => e.stopPropagation()}>
        <div className="start-chat__product">
          <img src={startChatProduct.mainPhotoUrl} alt="" />
          <div className="start-chat__product-name">{startChatProduct.name}</div>
        </div>
        <h3>Discuter avec le vendeur</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="pseudo">Ton pseudo</label>
            <input
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ex : Kodjo94"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="age">Ton âge</label>
            <input
              id="age"
              type="number"
              min={13}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex : 27"
            />
          </div>
          {error && <p className="field__error">{error}</p>}
          <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
            {loading ? 'Démarrage…' : 'Démarrer la discussion'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartChatModal;
