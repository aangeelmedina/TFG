// ─── Confirm modal ────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  warn?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, warn, onConfirm, onCancel }) => (
  <div className="n-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
    <div className="n-modal n-modal--sm">
      <div className="n-modal__header">
        <h3 className="n-modal__title">{title}</h3>
      </div>
      <div className="n-modal__body">
        <p className="n-modal__msg">{message}</p>
        {warn && <p className="n-modal__warn">{warn}</p>}
      </div>
      <div className="n-modal__footer">
        <button className="n-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="n-btn-danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </div>
  </div>
);