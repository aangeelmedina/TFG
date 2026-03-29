import { useNavigate } from "react-router-dom";
import type { Paciente } from "../../../types";

// ─── Modal nodos ──────────────────────────────────────────────────────────────

export function ModalNodos({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
    const navigate = useNavigate();
    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
            <div>
                <h3 className="modal__title">Nodos — {paciente.nombre} {paciente.apellidos}</h3>
                <p className="modal__sub">Árbol de comunicación · paciente #{paciente.id}</p>
            </div>
            <button className="modal__close" onClick={onClose}>✕</button>
            </div>
            <div className="modal__body">
            <p className="modal__placeholder">
                Conecta este modal con tu componente de nodos cuando esté listo.
            </p>
            <div className="modal__footer" style={{ marginTop: "1rem" }}>
                <button className="btn btn--edit" onClick={onClose}>Cancelar</button>
                <button className="btn-primary"
                onClick={() => navigate(`/pacientes/${paciente.id}/nodos`)}>
                Ir a nodos
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}