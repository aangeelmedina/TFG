import { useCallback, useEffect, useState } from "react";
import type { Arbol, Paciente } from "../../../types";
import { Toast } from "../Toast";
import { api } from "../../../services/api";
import { Topbar } from "../Topbar";
import { Spinner } from "../Spinner";
import { useToast } from "../../../hooks/useToast";
import { ConfirmModal } from "../modal/ConfirmModal";


// ══════════════════════════════════════════════════════════
//  VISTA 1 — Lista de árboles del paciente
// ══════════════════════════════════════════════════════════
interface ArbolesListProps {
    paciente: Paciente;
    onSelectArbol: (arbol: Arbol) => void;
    onBack: () => void;
}

export const ArbolesListView: React.FC<ArbolesListProps> = ({ paciente, onSelectArbol, onBack }) => {
    const [arboles, setArboles] = useState<Arbol[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creando, setCreando] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Arbol | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const { toast, show: showToast } = useToast();

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await api.arboles.list(paciente.id);
        if (res.error) setError(res.error);
        else setArboles(res.data ?? []);
        setLoading(false);
    }, [paciente.id]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim()) return;
        setCreando(true);
        const res = await api.arboles.create(paciente.id, nuevoTitulo.trim());
        setCreando(false);
        if (res.error) { showToast(res.error, "err"); return; }
        setNuevoTitulo("");
        setShowForm(false);
        showToast("Árbol creado", "ok");
        await cargar();
    };

    const handleDelete = async (arbol: Arbol) => {
        setDeletingId(arbol.id);
        const res = await api.arboles.delete(paciente.id, arbol.id);
        setDeletingId(null);
        setDeleteTarget(null);
        if (res.error) { showToast(res.error, "err"); return; }
        showToast("Árbol eliminado", "ok");
        await cargar();
    };

    return (
        <div className="n-page">
        <Topbar onBack={onBack} backLabel="Pacientes" title="Árboles de decisión" />

        <main className="n-main">
            {/* Heading */}
            <div className="n-heading">
            <div>
                <h1 className="n-heading__title">
                {paciente.nombre} {paciente.apellidos}
                </h1>
                <p className="n-heading__sub">
                Árboles de decisión · Paciente #{paciente.id}
                </p>
            </div>
            <button className="n-btn-primary" onClick={() => setShowForm(true)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Nuevo árbol
            </button>
            </div>

            {/* Form nuevo árbol */}
            {showForm && (
            <form className="n-new-form" onSubmit={handleCrear}>
                <input
                className="n-input"
                placeholder="Título del árbol…"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                autoFocus
                />
                <button className="n-btn-primary" type="submit" disabled={creando || !nuevoTitulo.trim()}>
                {creando ? <Spinner /> : "Crear"}
                </button>
                <button
                type="button"
                className="n-btn-ghost"
                onClick={() => { setShowForm(false); setNuevoTitulo(""); }}
                >
                Cancelar
                </button>
            </form>
            )}

            {/* Estado cargando */}
            {loading && (
            <div className="n-state-loading">
                <Spinner dark /> Cargando árboles…
            </div>
            )}

            {/* Error */}
            {error && !loading && (
            <div className="n-state-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
            </div>
            )}

            {/* Lista de árboles */}
            {!loading && !error && (
            <>
                {arboles.length === 0 ? (
                <div className="n-empty">
                    <p>Este paciente aún no tiene árboles de decisión.</p>
                    <p>Usa el botón <strong>Nuevo árbol</strong> para crear el primero.</p>
                </div>
                ) : (
                <div className="n-arboles-grid">
                    {arboles.map((arbol) => (
                    <div key={arbol.id} className="n-arbol-card">
                        <div className="n-arbol-card__icon">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="6" y="1" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="1" y="13" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="11" y="13" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M9 5v3M9 8H4v5M9 8h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        </div>
                        <div className="n-arbol-card__body">
                        <p className="n-arbol-card__title">{arbol.titulo}</p>
                        <div className="n-arbol-card__meta">
                            <span className="n-arbol-card__id">#{arbol.id}</span>
                            <span className="n-arbol-card__nodes">{arbol.num_nodos} nodos</span>
                            {arbol.creado_en && (
                            <span className="n-arbol-card__date">
                                {new Date(arbol.creado_en).toLocaleDateString("es-ES")}
                            </span>
                            )}
                        </div>
                        </div>
                        <div className="n-arbol-card__actions">
                        <button
                            className="n-btn-edit"
                            onClick={() => onSelectArbol(arbol)}
                            title="Editar árbol"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M8.5 1.5l2 2L4 10H2v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Editar
                        </button>
                        <button
                            className="n-btn-delete"
                            onClick={() => setDeleteTarget(arbol)}
                            disabled={deletingId === arbol.id}
                            title="Eliminar árbol"
                        >
                            {deletingId === arbol.id ? (
                            <Spinner dark />
                            ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M1.5 3h9M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 5.5v3M7 5.5v3M2.5 3l.6 6.5a.5.5 0 00.5.5h4.8a.5.5 0 00.5-.5L9.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            )}
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </>
            )}
        </main>

        {/* Confirm delete árbol */}
        {deleteTarget && (
            <ConfirmModal
            title="Eliminar árbol"
            message={`¿Eliminar el árbol "${deleteTarget.titulo}" y sus ${deleteTarget.num_nodos} nodos?`}
            warn="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
            />
        )}

        {toast && <Toast toast={toast} />}
        </div>
    );
};