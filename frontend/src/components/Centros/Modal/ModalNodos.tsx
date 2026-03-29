import NodosPage from "../../../pages/Nodos/NodosPage";
import type { Paciente } from "../../../types";


export function ModalNodos({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        <NodosPage
          paciente={{
            id: paciente.id,
            nombre: paciente.nombre,
            apellidos: paciente.apellidos,
          }}
          onBack={onClose}
        />
      </div>
    </div>
  );
}