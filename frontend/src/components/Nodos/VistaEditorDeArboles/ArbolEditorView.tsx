


// ══════════════════════════════════════════════════════════
//  VISTA 2 — Editor del árbol (árbol visual)

import { useCallback, useEffect, useState } from "react";
import type { Arbol, Nodo, Paciente } from "../../../types";
import { useToast } from "../../../hooks/useToast";
import { api } from "../../../services/api";
import { Topbar } from "../Topbar";
import { Toast } from "../Toast";
import { ConfirmModal } from "../modal/ConfirmModal";
import { Spinner } from "../Spinner";
import { NodoCard } from "../NodoCard/NodoCard";
import { TituloInlineEdit } from "../TituloInlineEdit";
import { NodoFormModal } from "../modal/NodoFormModal";

// ══════════════════════════════════════════════════════════
interface ArbolEditorProps {
    paciente: Paciente;
    arbolMeta: Arbol;
    onBack: () => void;
}

export const ArbolEditorView: React.FC<ArbolEditorProps> = ({ paciente, arbolMeta, onBack }) => {
    const [raiz, setRaiz] = useState<Nodo | null>(null);
    const [titulo, setTitulo] = useState(arbolMeta.titulo);
    const [editingTitulo, setEditingTitulo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addModal, setAddModal] = useState<number | null>(null);   // padre_id
    const [editModal, setEditModal] = useState<Nodo | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Nodo | null>(null);
    const { toast, show: showToast } = useToast();

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await api.arboles.get(paciente.id, arbolMeta.id);
        if (res.error) { setError(res.error); setLoading(false); return; }
        setRaiz(res.data?.raiz ?? null);
        setLoading(false);
    }, [paciente.id, arbolMeta.id]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleRenameArbol = async (nuevoTitulo: string) => {
        const res = await api.arboles.rename(paciente.id, arbolMeta.id, nuevoTitulo);
        if (res.error) { showToast(res.error, "err"); return; }
        setTitulo(nuevoTitulo);
        setEditingTitulo(false);
        showToast("Título actualizado", "ok");
    };

    const handleCrearNodo = async (padreId: number, texto: string, esFinal: boolean) => {
        const res = await api.nodos.create(paciente.id, arbolMeta.id, padreId, texto, esFinal);
        if (res.error) throw new Error(res.error);
        setAddModal(null);
        showToast("Nodo creado", "ok");
        await cargar();
    };

    const handleEditarNodo = async (nodo: Nodo, texto: string, esFinal: boolean) => {
        const res = await api.nodos.edit(paciente.id, arbolMeta.id, nodo.id, { texto, es_final: esFinal });
        if (res.error) throw new Error(res.error);
        setEditModal(null);
        showToast("Nodo actualizado", "ok");
        await cargar();
    };

    const handleEliminarNodo = async (nodo: Nodo) => {
        const res = await api.nodos.delete(paciente.id, arbolMeta.id, nodo.id);
        if (res.error) { showToast(res.error, "err"); setDeleteTarget(null); return; }
        setDeleteTarget(null);
        showToast("Nodo eliminado", "ok");
        await cargar();
    };

    const countNodos = (n: Nodo): number => 1 + n.hijos.reduce((a, h) => a + countNodos(h), 0);
    const countFinales = (n: Nodo): number => (n.es_final ? 1 : 0) + n.hijos.reduce((a, h) => a + countFinales(h), 0);
    const depth = (n: Nodo): number => n.hijos.length === 0 ? 0 : 1 + Math.max(...n.hijos.map(depth));

    return (
        <div className="n-page">
        <Topbar
            onBack={onBack}
            backLabel={`Árboles de ${paciente.nombre}`}
            title="Editor de árbol"
        />

        <main className="n-main">
            {/* Heading con título editable */}
            <div className="n-heading">
            <div className="n-heading__title-row">
                {editingTitulo ? (
                <TituloInlineEdit
                    value={titulo}
                    onSave={handleRenameArbol}
                    onCancel={() => setEditingTitulo(false)}
                />
                ) : (
                <>
                    <h1 className="n-heading__title">{titulo}</h1>
                    <button
                    className="n-btn-icon"
                    onClick={() => setEditingTitulo(true)}
                    title="Renombrar árbol"
                    >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M9.5 1.5l2 2L5 10H3v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    </button>
                </>
                )}
            </div>
            <p className="n-heading__sub">
                {paciente.nombre} {paciente.apellidos} · árbol #{arbolMeta.id}
            </p>
            </div>

            {/* Stats */}
            {raiz && !loading && (
            <div className="n-stats">
                <div className="n-stat"><span className="n-stat__val">{countNodos(raiz)}</span><span className="n-stat__lbl">Nodos</span></div>
                <div className="n-stat"><span className="n-stat__val n-stat__val--green">{countFinales(raiz)}</span><span className="n-stat__lbl">Finales</span></div>
                <div className="n-stat"><span className="n-stat__val n-stat__val--blue">{countNodos(raiz) - countFinales(raiz)}</span><span className="n-stat__lbl">Ramas</span></div>
                <div className="n-stat"><span className="n-stat__val n-stat__val--amber">{depth(raiz)}</span><span className="n-stat__lbl">Profundidad</span></div>
            </div>
            )}

            {loading && <div className="n-state-loading"><Spinner dark /> Cargando árbol…</div>}
            {error && !loading && <div className="n-state-error">{error}</div>}

            {/* Árbol visual */}
            {!loading && !error && raiz && (
            <div className="n-tree-wrap">
                <div className="n-tree-scroll">
                <div className="n-tree">
                    <ul className="n-tree__root">
                    <NodoCard
                        nodo={raiz}
                        depth={0}
                        onAdd={(id) => setAddModal(id)}
                        onEdit={(n) => setEditModal(n)}
                        onDelete={(n) => setDeleteTarget(n)}
                    />
                    </ul>
                </div>
                </div>
                <p className="n-tree-hint">
                Pulsa <span className="n-hint-plus">+</span> para añadir un hijo · Máximo 2 hijos por nodo
                </p>
            </div>
            )}
        </main>

        {/* Modal: añadir nodo */}
        {addModal !== null && (
            <NodoFormModal
            title="Nuevo nodo hijo"
            subtitle={`Hijo del nodo #${addModal}`}
            onClose={() => setAddModal(null)}
            onSubmit={(texto, esFinal) => handleCrearNodo(addModal, texto, esFinal)}
            />
        )}

        {/* Modal: editar nodo */}
        {editModal && (
            <NodoFormModal
            title="Editar nodo"
            subtitle={`Nodo #${editModal.id}`}
            initialTexto={editModal.texto}
            initialFinal={editModal.es_final}
            onClose={() => setEditModal(null)}
            onSubmit={(texto, esFinal) => handleEditarNodo(editModal, texto, esFinal)}
            submitLabel="Guardar cambios"
            />
        )}

        {/* Confirm delete nodo */}
        {deleteTarget && (
            <ConfirmModal
            title="Eliminar nodo"
            message={`¿Eliminar "${deleteTarget.texto}" y todos sus hijos?`}
            warn="Esta acción no se puede deshacer."
            onConfirm={() => handleEliminarNodo(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
            />
        )}

        {toast && <Toast toast={toast} />}
        </div>
    );
};