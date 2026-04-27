import { use, useState } from "react";
import { ESTADO_OPCIONES, FORM_VACIO, type Paciente, type PacienteForm } from "../../../types";
import { AuthContext } from "../../../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

interface ModalEditarProps {
  paciente: Paciente | null;
  centroId: number;
  onClose: () => void;
  onGuardado: () => void;
}

// ─── Modal editar / crear ─────────────────────────────────────────────────────

export function ModalEditar({ paciente, centroId, onClose, onGuardado }: ModalEditarProps) {
  const { user } = use(AuthContext)!;
  const esNuevo = paciente === null;

  const [form, setForm] = useState<PacienteForm>(
    esNuevo ? FORM_VACIO : {
      nombre:           paciente.nombre,
      apellidos:        paciente.apellidos,
      dni:              paciente.dni,
      edad:             paciente.edad,
      contacto:         paciente.contacto ?? "",
      historial_medico: paciente.historial_medico ?? "",
      estado:           paciente.estado,
      fecha_ingreso:    paciente.fecha_ingreso ?? "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "edad" ? Number(value) : value }));
  };

  // ─── Helpers de validación ──────────────────────────────────────────────
  const soloTeclaTelefono = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    if (/^[\d+\s\-()]$/.test(e.key)) return;
    e.preventDefault();
  };

  const soloTeclaTexto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    if (/^[a-zA-ZÀ-ÿÑñ\s']$/.test(e.key)) return;
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación DNI: 8 dígitos + 1 letra
    if (!/^\d{8}[A-Za-z]$/.test(form.dni)) {
      setError("El DNI debe tener 8 dígitos seguidos de 1 letra (ej: 12345678A)");
      return;
    }

    // Validación teléfono/contacto (si se rellena)
    if (form.contacto && !/^[+\d\s\-()]{7,15}$/.test(form.contacto)) {
      setError("El contacto debe ser un número de teléfono válido (ej: +34 612 345 678)");
      return;
    }

    // Validación edad
    if (form.edad < 0 || form.edad > 130) {
      setError("La edad debe estar entre 0 y 130 años");
      return;
    }

    setLoading(true);
    const url    = esNuevo
      ? `${API_URL}/centros/${centroId}/pacientes`
      : `${API_URL}/pacientes/${paciente!.id}`;
    const method = esNuevo ? "POST" : "PUT";
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: user!.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Error al guardar"); return; }
      onGuardado();
      onClose();
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h3 className="modal__title">
              {esNuevo ? "Nuevo paciente" : `Editar — ${paciente!.nombre} ${paciente!.apellidos}`}
            </h3>
            <p className="modal__sub">
              {esNuevo ? "Rellena los datos del nuevo paciente" : `ID #${paciente!.id}`}
            </p>
          </div>
          <button className="modal__close" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__grid">
            <div className="modal__field">
              <label className="modal__label">Nombre</label>
              <input className="modal__input" name="nombre" value={form.nombre}
                onChange={handleChange} onKeyDown={soloTeclaTexto} required
                placeholder="Nombre" maxLength={60} />
            </div>
            <div className="modal__field">
              <label className="modal__label">Apellidos</label>
              <input className="modal__input" name="apellidos" value={form.apellidos}
                onChange={handleChange} onKeyDown={soloTeclaTexto} required
                placeholder="Apellido Apellido" maxLength={80} />
            </div>
            <div className="modal__field">
              <label className="modal__label">DNI</label>
              <input className="modal__input modal__input--mono" name="dni" value={form.dni}
                onChange={handleChange} required placeholder="12345678A"
                maxLength={9} pattern="^\d{8}[A-Za-z]$"
                title="8 dígitos seguidos de 1 letra (ej: 12345678A)" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Edad</label>
              <input className="modal__input" name="edad" type="number" min={0} max={130}
                value={form.edad} onChange={handleChange} required />
            </div>
            <div className="modal__field">
              <label className="modal__label">Contacto</label>
              <input className="modal__input modal__input--mono" name="contacto"
                type="tel" value={form.contacto ?? ""} onChange={handleChange}
                onKeyDown={soloTeclaTelefono} placeholder="+34 6XX XXX XXX"
                maxLength={15} pattern="^[+\d\s\-()]{7,15}$"
                title="Número de teléfono válido (ej: +34 612 345 678)" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Fecha ingreso</label>
              <input className="modal__input" name="fecha_ingreso" type="date"
                value={form.fecha_ingreso ?? ""} onChange={handleChange} />
            </div>
            <div className="modal__field modal__field--full">
              <label className="modal__label">Estado</label>
              <select className="modal__input" name="estado" value={form.estado} onChange={handleChange}>
                {ESTADO_OPCIONES.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div className="modal__field modal__field--full">
              <label className="modal__label">Historial médico</label>
              <textarea className="modal__input modal__textarea" name="historial_medico"
                value={form.historial_medico ?? ""} onChange={handleChange}
                placeholder="Notas clínicas…" rows={3} />
            </div>
          </div>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__footer">
            <button type="button" className="btn btn--edit" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> Guardando…</>
                : esNuevo ? "Crear paciente" : "Guardar cambios"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}