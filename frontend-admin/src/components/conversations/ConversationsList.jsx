import { conversationStatusLabels } from '../../utils/formatTime.js';

const FILTERS = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'ACTIVE', label: 'Actives' },
  { value: 'INACTIVE', label: 'Inactives' },
  { value: 'ARCHIVED', label: 'Archivées' },
];

const statusBadgeClass = {
  ACTIVE: 'badge--confirm',
  INACTIVE: 'badge--pending',
  ARCHIVED: 'badge--neutral',
};

const ConversationsList = ({
  conversations,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  sessionGroups = {},
}) => {
  const filtered =
    filter === 'ALL' ? conversations : conversations.filter((c) => c.status === filter);

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
        filtered.map((conv) => {
          const siblingCount = (sessionGroups[conv.sessionId]?.length || 1) - 1;
          return (
          <button
            key={conv.id}
            className={`conv-list__item${conv.id === selectedId ? ' active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <img className="conv-list__avatar" src={conv.product.mainPhotoUrl} alt="" />
            <div className="conv-list__meta">
              <div className="conv-list__top">
                <span className="conv-list__name">
                  {conv.clientPseudo} · {conv.clientAge} ans
                </span>
                <span className={`badge ${statusBadgeClass[conv.status]}`}>
                  {conversationStatusLabels[conv.status]}
                </span>
                {siblingCount > 0 && (
                  <span className="badge badge--neutral" title="Même session navigateur">
                    +{siblingCount} autre{siblingCount > 1 ? 's' : ''} discussion
                    {siblingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="conv-list__product">{conv.product.name}</div>
              <div className="conv-list__last">
                {conv.messages?.[0]?.content || 'Aucun message pour le moment'}
              </div>
            </div>
          </button>
          );
        })
      )}
    </div>
  );
};

export default ConversationsList;
