import CentrosCard from "../CentrosCard/CentrosCard";
import "./CentroList.css";

import { use } from "react";
import { CentrosContext } from "../../context/CentrosContext";
import { AuthContext } from "../../context/AuthContext";

const CentroList = () => {
    const centrosContext = use(CentrosContext);
    const { user } = use(AuthContext)!;

    if (!centrosContext) {
        throw new Error("CentroList debe ser usado dentro de un CentrosProvider");
    }

    const { centros, loading, error } = centrosContext;

    if (loading) return (
        <div className="cl-state">
            <span className="cl-spinner" />
            <span>Cargando centros…</span>
        </div>
    );

    if (error) return (
        <div className="cl-state cl-state--error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <line x1="8" y1="5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.8" fill="currentColor" />
            </svg>
            Error: {error}
        </div>
    );

    if (centros.length === 0) return (
        <div className="cl-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".3">
                <rect x="2" y="10" width="28" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M10 10V8a6 6 0 0112 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>No hay centros disponibles.</span>
        </div>
    );

    return (
        <div className="cl-grid">
            {centros.map((centro) => (
                <CentrosCard
                    key={centro.id}
                    id={centro.id}
                    nombre={centro.nombre}
                    dirreccion={centro.direccion}
                    telefono={centro.telefono}
                    email={centro.email}
                    user_id={user!.id}
                    user_rol={user!.role ?? ""}
                />
            ))}
        </div>
    );
};

export default CentroList;