import { conversationStatusLabels } from '../../utils/formatTime.js';

const FILTERS = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'ACTIVE', label: 'Actives' },
  { value: 'EXPIRED', label: 'Expirées' },
  { value: 'DELETED', label: 'Supprimées' },
];

const statusBadgeClass = {
  PENDING: 'badge--pending',
  ACTIVE: 'badge--confirm',
  EXPIRED: 'badge--neutral',
  DELETED: 'badge--neutral',
};

const ConversationsList = ({
  conversations,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
}) => {
  const filtered = filter === 'ALL'
    ? conversations
    : conversations.filter((c) => c.status === filter);

  return (
    <div className="conv-list">
      <div className="conv-list__filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`chip${filter === f.value ? ' active' : ''}`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="table__empty">Aucune conversation ici.</p>
      ) : (
        filtered.map((conv) => (
          <button
            key={conv.id}
            className={`conv-list__item${conv.id === selectedId ? ' active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <img className="conv-list__avatar" src={conv.initiator.mainPhotoUrl} alt="" />
            <div className="conv-list__meta">
              <div className="conv-list__top">
                <span className="conv-list__name">
                  {conv.initiator.name} ({conv.initiator.category}) → {conv.target.name} ({conv.target.category})
                </span>
                <span className={`badge ${statusBadgeClass[conv.status]}`}>
                  {conversationStatusLabels[conv.status] || conv.status}
                </span>
              </div>
              <div className="conv-list__product">
                Initiateur: {conv.initiator.name} • Cible: {conv.target.name}
              </div>
              <div className="conv-list__last">
                {conv.messages?.[0]?.content || 'Aucun message pour le moment'}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default ConversationsList;