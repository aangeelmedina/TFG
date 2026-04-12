import { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface UsuarioDisponible {
  id: number;
  username: string;
  rol: string | null;
}

interface Props {
  centroId: number;
  onClose: () => void;
  currentUserId: number;
  onGuardado: () => void;
}

const ROLES_CENTRO = ["admin", "medico", "enfermero", "auxiliar"];

const ROL_STYLES: Record<string, { bg: string; color: string }> = {
  medico:    { bg: "#dbeafe", color: "#1e40af" },
  enfermero: { bg: "#d1fae5", color: "#065f46" },
  auxiliar:  { bg: "#fef3c7", color: "#92400e" },
  admin:     { bg: "#f3e8ff", color: "#6b21a8" },
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function ModalAnadirUsuario({ centroId, onClose, onGuardado,currentUserId }: Props) {
  const [usuarios,    setUsuarios]    = useState<UsuarioDisponible[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error,       setError]       = useState("");
  const [query,       setQuery]       = useState("");
  const [selected,    setSelected]    = useState<UsuarioDisponible | null>(null);
  const [rol,         setRol]         = useState(ROLES_CENTRO[0]);

  useEffect(() => {
    fetch(`${API_URL}/usuarios`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUsuarios(data))
      .catch(() => setError("No se pudo cargar la lista de usuarios"))
      .finally(() => setLoadingList(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return usuarios.filter((u) => u.username.toLowerCase().includes(q));
  }, [usuarios, query]);

  const handleSelect = (u: UsuarioDisponible) => {
    setSelected(u);
    if (u.rol) setRol(u.rol);
  };

  const handleSubmit = async () => {
    if (!selected) { setError("Selecciona un usuario."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/centros/${centroId}/asignar-usuario`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          usuario_id: selected.id, 
          rol,
          user_id: currentUserId,   // ← añadir
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al asignar usuario");
      onGuardado();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Añadir usuario al centro</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Busca y selecciona el usuario que quieres añadir a este centro.
          </p>

          {/* Barra de búsqueda */}
          <div className="user-search-wrap">
            <svg className="user-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="field-input user-search-input"
              type="text"
              placeholder="Buscar por nombre o email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="user-search-clear" onClick={() => setQuery("")}>✕</button>
            )}
          </div>

          {/* Lista de usuarios */}
          {loadingList ? (
            <div className="field-loading">
              <span className="btn-spinner btn-spinner--dark" /> Cargando usuarios…
            </div>
          ) : filtered.length === 0 ? (
            <div className="user-list-empty">Sin resultados para esa búsqueda.</div>
          ) : (
            <div className="user-list">
              {filtered.map((u) => {
                const rs = u.rol ? ROL_STYLES[u.rol] : null;
                const isSel = selected?.id === u.id;
                return (
                  <div
                    key={u.id}
                    className={`user-list-row${isSel ? " user-list-row--selected" : ""}`}
                    onClick={() => handleSelect(u)}
                  >
                    <div className="user-avatar">{initials(u.username)}</div>
                    <div className="user-info">
                      <span className="user-name">{u.username}</span>
                    </div>
                    {u.rol && rs && (
                      <span className="badge--role" style={{ background: rs.bg, color: rs.color }}>
                        {u.rol}
                      </span>
                    )}
                    {isSel && (
                      <svg width="16" height="16" viewBox="0 0 16 16" className="user-check">
                        <circle cx="8" cy="8" r="7" fill="#2563eb"/>
                        <polyline points="4,8 7,11 12,5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Panel usuario seleccionado + rol */}
          {selected && (
            <div className="user-selected-panel">
              <div className="user-selected-info">
                <div className="user-avatar">{initials(selected.username)}</div>
                <div className="user-info">
                  <span className="user-name">{selected.username}</span>
                </div>
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="field-group" style={{ marginTop: "0.6rem", marginBottom: 0 }}>
                <label className="field-label">Rol en el centro</label>
                <select
                  className="field-input"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  {ROLES_CENTRO.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && <div className="modal-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || loadingList || !selected}
          >
            {loading ? <span className="btn-spinner" /> : null}
            Asignar usuario
          </button>
        </div>
      </div>
    </div>
  );
}