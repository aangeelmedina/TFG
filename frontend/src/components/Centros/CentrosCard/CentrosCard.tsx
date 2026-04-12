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

const CentrosCard = (data: CentrosCardProps) => {
    const navigate = useNavigate();

    return (
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
            </div>
        </div>
    );
};

export default CentrosCard;
