const ConfirmDialog = ({ title, message, confirmLabel = 'Confirmer', onConfirm, onCancel }) => (
  <div className="overlay" onClick={onCancel}>
    <div className="modal" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="modal__actions">
        <button className="btn btn--ghost" onClick={onCancel}>
          Annuler
        </button>
        <button className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
