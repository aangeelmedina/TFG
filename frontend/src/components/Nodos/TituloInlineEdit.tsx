import { useState } from "react";

// ─── Título inline edit ───────────────────────────────────
interface TituloInlineEditProps {
    value: string;
    onSave: (v: string) => void;
    onCancel: () => void;
}

export const TituloInlineEdit: React.FC<TituloInlineEditProps> = ({ value, onSave, onCancel }) => {
    const [v, setV] = useState(value);
    return (
        <form
        className="n-titulo-edit"
        onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSave(v.trim()); }}
        >
        <input
            className="n-titulo-edit__input"
            value={v}
            onChange={(e) => setV(e.target.value)}
            autoFocus
        />
        <button type="submit" className="n-btn-primary" disabled={!v.trim()}>Guardar</button>
        <button type="button" className="n-btn-ghost" onClick={onCancel}>Cancelar</button>
        </form>
    );
};