import { useState, useEffect } from "react";
import "./CentrosCard.css";
import { useNavigate } from "react-router-dom";

interface CentrosCardProps {
    id: number;
    nombre: string;
    dirreccion: string;
    telefono: string;
    email: string;
    user_id: number;
    user_rol: string;
}

interface Usuario {
    id: number;
    username: string;
    rol: string;
}

interface UsuarioCentro {
    id: number;
    usuario_id: number;
    username: string;
    rol: string;
}

const ROLES = ["admin", "tutor", "PACIENTE"];

const CentrosCard = (data: CentrosCardProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuariosCentro, setUsuariosCentro] = useState<UsuarioCentro[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedRol, setSelectedRol] = useState<string>("tutor");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ texto: string; error: boolean }>({ texto: "", error: false });
    const API_URL = import.meta.env.VITE_API_URL ?? "";
    const navigate = useNavigate();

    const puedeAñadirUsuarios =
        data.user_rol === "superAdmin" ||
        usuariosCentro.some((u) => u.usuario_id === data.user_id && u.rol === "admin");

    useEffect(() => {
        fetch(`${API_URL}/centros/${data.id}/usuarios`)
            .then((res) => res.json())
            .then(setUsuariosCentro)
            .catch(console.error);
    }, [data.id]);

    const abrirModal = async () => {
        setModalOpen(true);
        setMensaje({ texto: "", error: false });
        setSelectedUser(null);
        setSelectedRol("tutor");

        try {
            const [resUsuarios, resAsignados] = await Promise.all([
                fetch(`${API_URL}/usuarios`),
                fetch(`${API_URL}/centros/${data.id}/usuarios`),
            ]);

            console.log("Status usuarios:", resUsuarios.status);
            console.log("Status asignados:", resAsignados.status);

            // ⚠️ Aquí falta validar que la respuesta sea OK
            if (!resUsuarios.ok) throw new Error(`/usuarios respondió ${resUsuarios.status}`);
            if (!resAsignados.ok) throw new Error(`/centros/${data.id}/usuarios respondió ${resAsignados.status}`);

            setUsuarios(await resUsuarios.json());
            setUsuariosCentro(await resAsignados.json());
        } catch (err) {
            console.error("Error real:", err); // <-- mira esto en la consola
            setMensaje({ texto: "Error al cargar usuarios.", error: true });
        }
    };

    const getRolEnCentro = (usuarioId: number) =>
        usuariosCentro.find((u) => u.usuario_id === usuarioId)?.rol ?? null;

    const asignarUsuario = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/centros/${data.id}/asignar-usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: selectedUser,
                    rol: selectedRol,
                    user_id: data.user_id,
                }),
            });
            const result = await res.json();
            setMensaje({ texto: result.message, error: !res.ok });
            if (res.ok) {
                const resAsignados = await fetch(`${API_URL}/centros/${data.id}/usuarios`);
                setUsuariosCentro(await resAsignados.json());
                setTimeout(() => setModalOpen(false), 1200);
            }
        } catch {
            setMensaje({ texto: "Error al asignar usuario.", error: true });
        }
        setLoading(false);
    };

    const eliminarUsuario = async (usuarioId: number) => {
        try {
            const res = await fetch(
                `${API_URL}/centros/${data.id}/asignar-usuario/${usuarioId}`,
                { method: "DELETE" }
            );
            if (res.ok) {
                setUsuariosCentro((prev) => prev.filter((u) => u.usuario_id !== usuarioId));
            }
        } catch {
            setMensaje({ texto: "Error al eliminar usuario.", error: true });
        }
    };

    return (
        <>
            <div className="cc-card">
                {/* Header */}
                <div className="cc-card__header">
                    <div className="cc-card__icon">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="1" y="6" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5 6V4.5a4 4 0 018 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <rect x="7" y="10" width="4" height="4" rx="0.75" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    </div>
                    <h3 className="cc-card__title">{data.nombre}</h3>
                </div>

                {/* Info */}
                <div className="cc-card__body">
                    <div className="cc-info-row">
                        <span className="cc-info-icon">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1a3.5 3.5 0 013.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 016 1z" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.1" />
                            </svg>
                        </span>
                        <span className="cc-info-text">{data.dirreccion}</span>
                    </div>
                    <div className="cc-info-row">
                        <span className="cc-info-icon">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 2.5C2 2.5 3 5 5.5 7.5S9.5 10 9.5 10l1.5-1.5-2-2-1.2 1.2C6.8 7 5 5.2 4.3 4.2L5.5 3 3.5.5 2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="cc-info-text cc-mono">{data.telefono}</span>
                    </div>
                    <div className="cc-info-row">
                        <span className="cc-info-icon">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <rect x="1" y="2.5" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M1 4l5 3 5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span className="cc-info-text cc-mono">{data.email}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="cc-card__footer">
                    <button className="cc-btn cc-btn--primary" onClick={() => navigate(`/centros/${data.id}/admin`)}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
                            <line x1="6" y1="3.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        Ver detalles
                    </button>

                    {puedeAñadirUsuarios && (
                        <button className="cc-btn cc-btn--ghost" onClick={abrirModal}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <circle cx="5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M1 10c0-2 1.8-3.5 4-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <line x1="9" y1="7" x2="9" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="7" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Añadir usuario
                        </button>
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <div className="cc-overlay" onClick={() => setModalOpen(false)}>
                    <div className="cc-modal" onClick={(e) => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="cc-modal__header">
                            <div>
                                <h3 className="cc-modal__title">Gestión de usuarios</h3>
                                <p className="cc-modal__sub">{data.nombre}</p>
                            </div>
                            <button className="cc-modal__close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>

                        <div className="cc-modal__body">
                            {/* Asignados */}
                            {usuariosCentro.length > 0 && (
                                <div className="cc-section">
                                    <p className="cc-section__label">Usuarios asignados</p>
                                    <div className="cc-assigned-list">
                                        {usuariosCentro.map((u) => (
                                            <div key={u.id} className="cc-user-row cc-user-row--assigned">
                                                <div className="cc-user-avatar">{u.username[0].toUpperCase()}</div>
                                                <span className="cc-user-name">{u.username}</span>
                                                <span className="cc-badge cc-badge--role">{u.rol}</span>
                                                <button
                                                    className="cc-btn-remove"
                                                    onClick={() => eliminarUsuario(u.usuario_id)}
                                                    title="Eliminar usuario"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                        <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selector */}
                            <div className="cc-section">
                                <p className="cc-section__label">Seleccionar usuario</p>
                                <div className="cc-user-list">
                                    {usuarios.length === 0 ? (
                                        <div className="cc-loading">Cargando usuarios…</div>
                                    ) : (
                                        usuarios.map((u) => {
                                            const rolActual = getRolEnCentro(u.id);
                                            const isSelected = selectedUser === u.id;
                                            return (
                                                <div
                                                    key={u.id}
                                                    className={`cc-user-row cc-user-row--selectable ${isSelected ? "cc-user-row--selected" : ""}`}
                                                    onClick={() => setSelectedUser(u.id)}
                                                >
                                                    <div className="cc-user-avatar">{u.username[0].toUpperCase()}</div>
                                                    <span className="cc-user-name">{u.username}</span>
                                                    <div className="cc-user-badges">
                                                        {rolActual && <span className="cc-badge cc-badge--assigned">{rolActual}</span>}
                                                        <span className="cc-badge cc-badge--global">{u.rol}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <svg className="cc-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Rol selector */}
                            <div className="cc-section cc-rol-section">
                                <label className="cc-section__label">Rol en este centro</label>
                                <select
                                    className="cc-select"
                                    value={selectedRol}
                                    onChange={(e) => setSelectedRol(e.target.value)}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mensaje */}
                            {mensaje.texto && (
                                <p className={`cc-mensaje ${mensaje.error ? "cc-mensaje--error" : "cc-mensaje--ok"}`}>
                                    {mensaje.texto}
                                </p>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="cc-modal__footer">
                            <button className="cc-btn cc-btn--ghost" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </button>
                            <button
                                className="cc-btn cc-btn--primary"
                                onClick={asignarUsuario}
                                disabled={!selectedUser || loading}
                            >
                                {loading ? (
                                    <><span className="cc-spinner" /> Guardando…</>
                                ) : (
                                    <>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M1.5 6.5L4.5 9.5L10.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Confirmar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CentrosCard;