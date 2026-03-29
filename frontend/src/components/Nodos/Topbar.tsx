

// ─── Topbar ───────────────────────────────────────────────
interface TopbarProps {
  onBack?: () => void;
  backLabel?: string;
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onBack, backLabel = "Volver", title }) => (
  <header className="n-topbar">
    {onBack && (
      <button className="n-topbar__back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {backLabel}
      </button>
    )}
    <span className="n-topbar__brand">{title}</span>
    <div className="n-topbar__right">
      <span className="n-topbar__user">Admin</span>
      <span className="n-topbar__rol">Admin</span>
    </div>
  </header>
);