import { useState } from "react";
import { Spinner } from "../Spinner";

// ─── Modal genérico para crear/editar nodo ────────────────
interface NodoFormModalProps {
    title: string;
    subtitle?: string;
    initialTexto?: string;
    initialFinal?: boolean;
    submitLabel?: string;
    onClose: () => void;
    onSubmit: (texto: string, esFinal: boolean) => Promise<void>;
}

export const NodoFormModal: React.FC<NodoFormModalProps> = ({
    title, subtitle, initialTexto = "", initialFinal = false,
    submitLabel = "Crear nodo", onClose, onSubmit,
}) => {
    const [texto, setTexto] = useState(initialTexto);
    const [esFinal, setEsFinal] = useState(initialFinal);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim()) return;
        setLoading(true);
        setError(null);
        try {
        await onSubmit(texto.trim(), esFinal);
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="n-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="n-modal">
            <div className="n-modal__header">
            <div>
                <h3 className="n-modal__title">{title}</h3>
                {subtitle && <p className="n-modal__sub">{subtitle}</p>}
            </div>
            <button className="n-modal__close" onClick={onClose}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            </button>
            </div>

            <form className="n-modal__form" onSubmit={handleSubmit}>
            <div className="n-field">
                <label className="n-label">Texto del nodo</label>
                <input
                className="n-input"
                placeholder="Ej: ¿Tienes fiebre?"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                autoFocus
                required
                />
            </div>

            <div className="n-field">
                <label className="n-label">Tipo de nodo</label>
                <div
                className={`n-toggle ${esFinal ? "n-toggle--on" : ""}`}
                onClick={() => setEsFinal(!esFinal)}
                >
                <div className="n-toggle__track">
                    <div className={`n-toggle__dot ${esFinal ? "n-toggle__dot--on" : ""}`} />
                </div>
                <div>
                    <p className="n-toggle__label">Nodo final (hoja)</p>
                    <p className="n-toggle__desc">No podrá tener hijos. Actúa como mensaje de cierre.</p>
                </div>
                </div>
            </div>

            {error && <p className="n-form-error">{error}</p>}

            <div className="n-modal__footer">
                <button type="button" className="n-btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                <button type="submit" className="n-btn-primary" disabled={loading || !texto.trim()}>
                {loading ? <><Spinner /> Guardando…</> : submitLabel}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};