import type { Trabajador } from "../../../types";

interface Props {
  personal: Trabajador[];
  resetingId: number | null;
  onResetPassword: (t: Trabajador) => void;
}

export function PersonalTable({ personal, resetingId, onResetPassword }: Props) {
  if (personal.length === 0) {
    return (
      <div className="table-empty">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".25">
          <circle cx="16" cy="10" r="6" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 30C3 23 9 18 16 18C23 18 29 23 29 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span>No hay personal registrado en este centro.</span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="patients-table">
        <thead>
          <tr>
            <th>ID usuario</th>
            <th>Username</th>
            <th>Rol en centro</th>
            <th className="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((t, idx) => {
            const rolStr = t.rol ?? "—";
            const rolKey = rolStr.toLowerCase().replace(/\s+/g, "-");

            return (
              <tr
                key={t.id}
                className="table-row"
                style={{ animationDelay: `${idx * 35}ms` }}
              >
                <td className="mono">#{t.usuario_id}</td>
                <td>
                  <div className="patient-cell">
                    <div className="patient-avatar">
                      {(t.username ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="patient-name">{t.username ?? "—"}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge badge--role badge--${rolKey}`}>
                    {rolStr}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action--reset btn"
                      onClick={() => onResetPassword(t)}
                      disabled={resetingId === t.usuario_id}
                      title="Resetear contraseña"
                    >
                      {resetingId === t.usuario_id ? (
                        <span className="btn-spinner btn-spinner--dark" />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 6.5C2 4 4 2 6.5 2C8.5 2 10.2 3.2 11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M11 2V5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11 6.5C11 9 9 11 6.5 11C4.5 11 2.8 9.8 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                      Resetear contraseña
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}