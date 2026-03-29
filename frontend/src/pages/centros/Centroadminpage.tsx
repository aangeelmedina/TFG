import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { use } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./CentroAdminPage.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadoPaciente =
  | "En tratamiento"
  | "Alta médica"
  | "Pendiente evaluación"
  | "Baja temporal";

interface Paciente {
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  estado: EstadoPaciente;
  fecha_ingreso: string | null;
  contacto: string | null;
  historial_medico: string | null;
  centro_id: number;
}

type PacienteForm = Omit<Paciente, "id" | "centro_id">;

const ESTADO_OPCIONES: EstadoPaciente[] = [
  "En tratamiento",
  "Alta médica",
  "Pendiente evaluación",
  "Baja temporal",
];

const FORM_VACIO: PacienteForm = {
  nombre: "",
  apellidos: "",
  dni: "",
  edad: 0,
  contacto: "",
  historial_medico: "",
  estado: "En tratamiento",
  fecha_ingreso: "",
};

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function estadoClass(estado: EstadoPaciente): string {
  const map: Record<EstadoPaciente, string> = {
    "En tratamiento":       "badge badge--tratamiento",
    "Alta médica":          "badge badge--alta",
    "Pendiente evaluación": "badge badge--pendiente",
    "Baja temporal":        "badge badge--baja",
  };
  return map[estado] ?? "badge";
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ pacientes }: { pacientes: Paciente[] }) {
  const enTratamiento = pacientes.filter((p) => p.estado === "En tratamiento").length;
  const pendientes    = pacientes.filter((p) => p.estado === "Pendiente evaluación").length;
  const altas         = pacientes.filter((p) => p.estado === "Alta médica").length;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-card__value">{pacientes.length}</span>
        <span className="stat-card__label">Total pacientes</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value stat-card__value--tratamiento">{enTratamiento}</span>
        <span className="stat-card__label">En tratamiento</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value stat-card__value--pendiente">{pendientes}</span>
        <span className="stat-card__label">Pendientes evaluación</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value stat-card__value--alta">{altas}</span>
        <span className="stat-card__label">Altas médicas</span>
      </div>
    </div>
  );
}

// ─── PacientesTable ───────────────────────────────────────────────────────────

interface TableProps {
  pacientes: Paciente[];
  onEditar: (p: Paciente) => void;
  onVerNodos: (p: Paciente) => void;
}

function PacientesTable({ pacientes, onEditar, onVerNodos }: TableProps) {
  if (pacientes.length === 0) {
    return (
      <div className="table-empty">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".25">
          <rect x="2" y="6" width="28" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
          <line x1="8" y1="13" x2="24" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>No se encontraron pacientes</span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="patients-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>DNI</th>
            <th>Edad</th>
            <th>Estado</th>
            <th>Fecha ingreso</th>
            <th>Contacto</th>
            <th className="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p, idx) => (
            <tr key={p.id} style={{ animationDelay: `${idx * 35}ms` }} className="table-row">
              <td>
                <div className="patient-cell">
                  <div className="patient-avatar">
                    {p.nombre[0]}{p.apellidos?.[0] ?? ""}
                  </div>
                  <div>
                    <div className="patient-name">{p.nombre} {p.apellidos}</div>
                    <div className="patient-id">#{p.id}</div>
                  </div>
                </div>
              </td>
              <td className="mono">{p.dni || "—"}</td>
              <td>{p.edad} años</td>
              <td><span className={estadoClass(p.estado)}>{p.estado}</span></td>
              <td>{formatFecha(p.fecha_ingreso)}</td>
              <td className="mono">{p.contacto || "—"}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn--edit" onClick={() => onEditar(p)} title="Editar">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 1.5L12.5 4.5L5 12H2V9L9.5 1.5Z" stroke="currentColor"
                        strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    Editar
                  </button>
                  <button className="btn btn--nodes" onClick={() => onVerNodos(p)} title="Ver nodos">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="2" cy="2" r="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="12" cy="2" r="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="2" cy="12" r="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="12" cy="12" r="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <line x1="3" y1="3" x2="6" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                      <line x1="11" y1="3" x2="8" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                      <line x1="3" y1="11" x2="6" y2="8" stroke="currentColor" strokeWidth="1.2"/>
                      <line x1="11" y1="11" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    Ver nodos
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal editar / crear ─────────────────────────────────────────────────────

interface ModalEditarProps {
  paciente: Paciente | null;
  centroId: number;
  onClose: () => void;
  onGuardado: () => void;
}

function ModalEditar({ paciente, centroId, onClose, onGuardado }: ModalEditarProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
                onChange={handleChange} required placeholder="Nombre" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Apellidos</label>
              <input className="modal__input" name="apellidos" value={form.apellidos}
                onChange={handleChange} required placeholder="Apellido Apellido" />
            </div>
            <div className="modal__field">
              <label className="modal__label">DNI</label>
              <input className="modal__input modal__input--mono" name="dni" value={form.dni}
                onChange={handleChange} required placeholder="12345678A" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Edad</label>
              <input className="modal__input" name="edad" type="number" min={0} max={130}
                value={form.edad} onChange={handleChange} required />
            </div>
            <div className="modal__field">
              <label className="modal__label">Contacto</label>
              <input className="modal__input modal__input--mono" name="contacto"
                value={form.contacto ?? ""} onChange={handleChange} placeholder="+34 6XX XXX XXX" />
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

// ─── Modal nodos ──────────────────────────────────────────────────────────────

function ModalNodos({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState = Paciente | "nuevo" | null;

export default function CentroAdminPage() {
  const { centroId } = useParams<{ centroId: string }>();
  const navigate     = useNavigate();
  const { user }     = use(AuthContext)!;

  const [pacientes,    setPacientes]    = useState<Paciente[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [errorData,    setErrorData]    = useState("");
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPaciente | "">("");
  const [modalEditar,  setModalEditar]  = useState<ModalState>(null);
  const [modalNodos,   setModalNodos]   = useState<Paciente | null>(null);
  const [abrirEditar,  setAbrirEditar]  = useState(false);

  const id = Number(centroId);

  const cargarPacientes = useCallback(async () => {
    setLoadingData(true);
    setErrorData("");
    try {
      const res = await fetch(
        `${API_URL}/centros/${id}/pacientes?user_id=${user!.id}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al cargar");
      setPacientes(await res.json());
    } catch (e) {
      setErrorData((e as Error).message);
    } finally {
      setLoadingData(false);
    }
  }, [id, user]);

  useEffect(() => { cargarPacientes(); }, [cargarPacientes]);

  const pacientesFiltrados = pacientes.filter((p) => {
    const txt = busqueda.toLowerCase();
    const coincideTexto =
      !busqueda ||
      `${p.nombre} ${p.apellidos}`.toLowerCase().includes(txt) ||
      p.dni.toLowerCase().includes(txt) ||
      String(p.id).includes(txt);
    return coincideTexto && (!filtroEstado || p.estado === filtroEstado);
  });

  return (
    <div className="admin-page">
      <main className="admin-main">
        {/* Heading */}
        <div className="page-heading">
          <div>
            <button className="page-back" onClick={() => navigate(-1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Volver
            </button>
            <h1 className="page-heading__title">Panel del centro</h1>
            <p className="page-heading__sub">Centro ID {centroId} · {user?.role ?? ""}</p>
          </div>
          <button className="btn-primary" onClick={() => { setModalEditar("nuevo"); setAbrirEditar(true); }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo paciente
          </button>
        </div>

        {/* Stats */}
        <StatsBar pacientes={pacientes} />

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10" y1="10" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Buscar por nombre, DNI o ID…"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="search-input" />
            {busqueda && <button className="search-clear" onClick={() => setBusqueda("")}>✕</button>}
          </div>
          <select className="filter-select" value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoPaciente | "")}>
            <option value="">Todos los estados</option>
            {ESTADO_OPCIONES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <span className="results-count">
            {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="table-loading">
            <span className="btn-spinner btn-spinner--dark" />
            Cargando pacientes…
          </div>
        ) : errorData ? (
          <div className="table-error">{errorData}</div>
        ) : (
          <PacientesTable
            pacientes={pacientesFiltrados}
            onEditar={(p) => { setModalEditar(p); setAbrirEditar(true); }}
            onVerNodos={(p) => setModalNodos(p)}
          />
        )}
      </main>

      {abrirEditar && (
        <ModalEditar
          paciente={modalEditar === "nuevo" ? null : modalEditar as Paciente}
          centroId={id}
          onClose={() => { setAbrirEditar(false); setModalEditar(null); }}
          onGuardado={cargarPacientes}
        />
      )}

      {modalNodos && (
        <ModalNodos paciente={modalNodos} onClose={() => setModalNodos(null)} />
      )}
    </div>
  );
}