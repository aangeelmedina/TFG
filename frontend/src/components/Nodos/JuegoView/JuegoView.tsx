import { useCallback, useEffect, useRef, useState } from "react";
import type { Arbol, NodoJuego, NodoPaciente } from "../../../types";
import { api } from "../../../services/api";
import { Spinner } from "../Spinner";
import { Topbar } from "../Topbar";
import "../../../pages/Nodos/NodosPage.css";


// ══════════════════════════════════════════════════════════
//  VISTA JUEGO
// ══════════════════════════════════════════════════════════

const CLICK_DELAY = 260; // ms para distinguir simple vs doble click

export const JuegoView: React.FC<{
    paciente: NodoPaciente;
    arbol: Arbol;
    nodoInicial?: number;
    onBack: () => void; // vuelve a selección de árbol
}> = ({ paciente, arbol, nodoInicial, onBack }) => {
    const [nodo, setNodo]       = useState<NodoJuego | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);
    const [animKey, setAnimKey] = useState(0); // fuerza re-animación al cambiar nodo
    const clickTimer            = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const cargarNodo = useCallback(async (nodo_id?: number) => {
    setLoading(true); setError(null);
    const res = await api.juego.getNodo(paciente.id, arbol.id, nodo_id);
    if (res.error) { setError(res.error); setLoading(false); return; }
    setNodo(res.data!);
    setAnimKey((k) => k + 1);
    setLoading(false);
    }, [paciente.id, arbol.id]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cargarNodo(nodoInicial); }, [paciente.id, arbol.id, nodoInicial]);

  // Navega al hijo indicado por índice (0 = click simple, 1 = doble click)
    const navegarA = (hijoIdx: 0 | 1) => {
        if (!nodo || nodo.es_final) return;
        const hijo = nodo.hijos[hijoIdx];
        if (hijo) cargarNodo(hijo.id);
    };

    // Gestión click simple vs doble click sobre el botón principal
    const handleClick = () => {
        if (!nodo || nodo.es_final || nodo.num_hijos === 0) return;
    
        if (nodo.num_hijos === 1) {
        // Solo un hijo: click simple navega directo
        navegarA(0);
        return;
        }

        // Dos hijos: esperamos para ver si hay doble click
        if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
        // Doble click → hijo 1
        navegarA(1);
        } else {
        clickTimer.current = setTimeout(() => {
            clickTimer.current = null;
            // Click simple → hijo 0
            navegarA(0);
        }, CLICK_DELAY);
        }
    };
    if (loading) {
        return (
        <div className="nj-screen">
            <div className="nj-loading"><Spinner dark /> Cargando…</div>
        </div>
        );
    }
    if (error) {
        return (
        <div className="nj-screen">
            <div className="nj-error">{error}</div>
            <button className="nj-btn-secondary" onClick={onBack}>Volver a árboles</button>
        </div>
        );
    }

    if (!nodo) return null;

  // ── Pantalla FINAL ────────────────────────────────────
    if (nodo.es_final) {
        return (
        <div className="nj-screen nj-screen--final">
            <Topbar onBack={onBack} backLabel={`Árboles de ${paciente.nombre}`} title="Árbol de decisión" />
            <div className="nj-final" key={animKey}>
            <div className="nj-final__icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="2" />
                <path d="M10 18.5L15.5 24L26 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <p className="nj-final__label">Resultado</p>
            <h2 className="nj-final__texto">{nodo.texto}</h2>
            <p className="nj-final__nivel">Nivel {nodo.nivel} · {arbol.titulo}</p>
            <button className="nj-btn-restart" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Elegir otro árbol
            </button>
            </div>
        </div>
        );
    }

    // ── Pantalla JUEGO ────────────────────────────────────
    const tieneDosPaths = nodo.num_hijos === 2;
    
    return (
        <div className="nj-screen">
        <Topbar onBack={onBack} backLabel={`Árboles de ${paciente.nombre}`} title="Árbol de decisión" />
    
        <div className="nj-meta">
            <span className="nj-meta__arbol">{arbol.titulo}</span>
            <span className="nj-meta__nivel">Nivel {nodo.nivel}</span>
        </div>
    
        {/* Botón principal — ocupa la mayor parte de la pantalla */}
        <div className="nj-stage" key={animKey}>
            <button
            className={`nj-btn-main ${nodo.num_hijos === 0 ? "nj-btn-main--disabled" : ""}`}
            onClick={handleClick}
            disabled={nodo.num_hijos === 0}
            >
            <span className="nj-btn-main__texto">{nodo.texto}</span>
    
            {/* Indicador de opciones */}
            {nodo.num_hijos > 0 && (
                <div className="nj-hint">
                {tieneDosPaths ? (
                    <>
                    <span className="nj-hint__chip nj-hint__chip--single">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <rect x="1" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                        </svg>
                        1 clic → {nodo.hijos[0].texto}
                    </span>
                    <span className="nj-hint__chip nj-hint__chip--double">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <rect x="1" y="1" width="4" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        <rect x="6" y="1" width="4" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        </svg>
                        2 clics → {nodo.hijos[1].texto}
                    </span>
                    </>
                ) : (
                    <span className="nj-hint__chip nj-hint__chip--single">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <rect x="1" y="1" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    Pulsa para continuar
                    </span>
                )}
                </div>
            )}
            </button>
        </div>
        </div>
    );
};