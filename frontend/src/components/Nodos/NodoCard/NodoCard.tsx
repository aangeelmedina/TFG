import type { Nodo } from "../../../types";


// ─── Nodo card (recursivo) ────────────────────────────────
interface NodoCardProps {
    nodo: Nodo;
    depth: number;
    onAdd: (padreId: number) => void;
    onEdit: (nodo: Nodo) => void;
    onDelete: (nodo: Nodo) => void;
}

export const NodoCard: React.FC<NodoCardProps> = ({ nodo, depth, onAdd, onEdit, onDelete }) => {
    const puedeAgregarHijo = nodo.hijos.length < 2 && !nodo.es_final;
    const initials = nodo.texto.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

    return (
        <li className="n-node">
        <div className={`n-card ${nodo.es_final ? "n-card--final" : ""} ${nodo.padre_id === null ? "n-card--root" : ""}`}>
            {nodo.padre_id !== null && (
            <span className="n-card__depth">Nivel {depth}</span>
            )}

            <div className={`n-card__avatar ${nodo.es_final ? "n-card__avatar--final" : nodo.padre_id === null ? "n-card__avatar--root" : ""}`}>
            {nodo.es_final ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 6.5L5 10L11.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : nodo.padre_id === null ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4.5 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            ) : (
                <span className="n-card__initials">{initials}</span>
            )}
            </div>

            <div className="n-card__body">
            <p className="n-card__texto">{nodo.texto}</p>
            <div className="n-card__meta">
                <span className="n-card__id">#{nodo.id}</span>
                <span className={`n-badge ${nodo.es_final ? "n-badge--final" : nodo.padre_id === null ? "n-badge--root" : "n-badge--branch"}`}>
                {nodo.es_final ? "Final" : nodo.padre_id === null ? "Raíz" : "Rama"}
                </span>
                <span className="n-card__children">{nodo.hijos.length}/2</span>
            </div>
            </div>

            <div className="n-card__actions">
            {puedeAgregarHijo && (
                <button className="n-btn-add-node" onClick={() => onAdd(nodo.id)} title="Añadir hijo">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                </button>
            )}
            <button className="n-btn-edit-node" onClick={() => onEdit(nodo)} title="Editar nodo">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7.5 1.5l2 2L3 10H1v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            </button>
            {nodo.padre_id !== null && (
                <button className="n-btn-del-node" onClick={() => onDelete(nodo)} title="Eliminar nodo">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 3h8M4 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4.5 5v3M6.5 5v3M2.5 3l.5 6a.5.5 0 00.5.5h4a.5.5 0 00.5-.5l.5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                </button>
            )}
            </div>
        </div>

        {nodo.hijos.length > 0 && (
            <ul className="n-node__children">
            {nodo.hijos.map((hijo) => (
                <NodoCard
                key={hijo.id}
                nodo={hijo}
                depth={depth + 1}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                />
            ))}
            </ul>
        )}
        </li>
    );
};