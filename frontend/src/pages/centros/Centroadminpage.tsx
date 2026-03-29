import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { use } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./CentroAdminPage.css";
import { ESTADO_OPCIONES, type EstadoPaciente, type Paciente } from "../../types";
import { StatsBar } from "../../components/Centros/StatsBar/StatsBar";
import { PacientesTable } from "../../components/Centros/Table/PacientesTable";
import { ModalEditar } from "../../components/Centros/Modal/ModalEditar";
import { ModalNodos } from "../../components/Centros/Modal/ModalNodos";
const API_URL = import.meta.env.VITE_API_URL;


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