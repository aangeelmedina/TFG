

// ─── Spinner inline ───────────────────────────────────────
export const Spinner: React.FC<{ dark?: boolean }> = ({ dark }) => (
    <span className={`n-spinner${dark ? " n-spinner--dark" : ""}`} />
);