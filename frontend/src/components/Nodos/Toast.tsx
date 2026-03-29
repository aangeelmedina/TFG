
import type { ToastState } from "../../types";

// ─── Toast ────────────────────────────────────────────────
export const Toast: React.FC<{ toast: NonNullable<ToastState> }> = ({ toast }) => (
  <div className={`n-toast ${toast.type === "ok" ? "n-toast--ok" : "n-toast--err"}`}>
    {toast.type === "ok" ? (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1.5 6.5L5 10L11.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ) : (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )}
    {toast.msg}
  </div>
);
