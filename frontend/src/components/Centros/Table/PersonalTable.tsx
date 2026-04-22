import type { Trabajador } from "../../../types";

interface Props {
  personal: Trabajador[];
  resetingId: number | null;
  togglingId: number | null;
  userRol: string | null;
  onResetPassword: (t: Trabajador) => void;
  onToggleEstado: (t: Trabajador) => void;
}

export function PersonalTable({ personal, resetingId, togglingId, userRol, onResetPassword, onToggleEstado }: Props) {
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
                className={`table-row${t.activo ? "" : " table-row--inactive"}`}
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
                  {!t.activo && (
                    <span className="badge badge--inactive" style={{ marginLeft: 6 }}>Inactivo</span>
                  )}
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
                    {(userRol === "superAdmin" || userRol === "admin") && (
                      <button
                        className={`btn ${t.activo ? "btn--deactivate" : "btn--activate"}`}
                        onClick={() => onToggleEstado(t)}
                        disabled={togglingId === t.usuario_id}
                        title={t.activo ? "Marcar como inactivo" : "Marcar como activo"}
                      >
                        {togglingId === t.usuario_id ? (
                          <span className="btn-spinner btn-spinner--dark" />
                        ) : t.activo ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                              <line x1="4" y1="6.5" x2="9" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Desactivar
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                              <line x1="6.5" y1="4" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              <line x1="4" y1="6.5" x2="9" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Activar
                          </>
                        )}
                      </button>
                    )}
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