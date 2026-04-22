import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { use } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Centroadminpage.css";
import { ESTADO_OPCIONES, type EstadoPaciente, type ModalState, type Paciente, type Tab, type Trabajador } from "../../types";
import { StatsBar } from "../../components/Centros/StatsBar/StatsBar";
import { PacientesTable } from "../../components/Centros/Table/PacientesTable";
import { ModalEditar } from "../../components/Centros/Modal/ModalEditar";
import { ModalNodos } from "../../components/Centros/Modal/ModalNodos";
import { PersonalTable } from "../../components/Centros/Table/PersonalTable";
import { ModalAnadirUsuario } from "../../components/Centros/Modal/ModalAnadirUsuario";
import { ConfirmModal } from "../../components/Nodos/modal/ConfirmModal";
import { Toast } from "../../components/Nodos/Toast";
import { useToast } from "../../hooks/useToast";


const API_URL = import.meta.env.VITE_API_URL;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CentroAdminPage() {
  const { centroId } = useParams<{ centroId: string }>();
  const navigate     = useNavigate();
  const { user,token } = use(AuthContext)!;

  // ── Pacientes state ──
  const [pacientes,    setPacientes]    = useState<Paciente[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [errorData,    setErrorData]    = useState("");
  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPaciente | "">("");
  const [modalEditar,  setModalEditar]  = useState<ModalState>(null);
  const [modalNodos,   setModalNodos]   = useState<Paciente | null>(null);
  const [abrirEditar,  setAbrirEditar]  = useState(false);

  // ── Personal state ──
  const [personal,         setPersonal]         = useState<Trabajador[]>([]);
  const [loadingPersonal,  setLoadingPersonal]  = useState(false);
  const [errorPersonal,    setErrorPersonal]    = useState("");
  const [modalAnadirUser,  setModalAnadirUser]  = useState(false);
  const [resetingId,       setResetingId]       = useState<number | null>(null);
  const [togglingId,       setTogglingId]       = useState<number | null>(null);
  const [pacienteAEliminar, setPacienteAEliminar] = useState<Paciente | null>(null);
  const [trabajadorAReset,  setTrabajadorAReset]  = useState<Trabajador | null>(null);
  const { toast, show: showToast } = useToast();

  // ── Tab state ──
  const [tab, setTab] = useState<Tab>("pacientes");

  const id = Number(centroId);

  const personalVisible = user?.role === "superAdmin"
    ? personal
    : personal.filter((t) => t.activo);

  const puedeGestionar = 
    user?.role === "superAdmin" ||
    personal.some(u => u.usuario_id === user?.id && u.rol === "admin");

  // ── Fetch pacientes ──
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

  // ── Fetch personal ──
  const cargarPersonal = useCallback(async () => {
    setLoadingPersonal(true);
    setErrorPersonal("");
    try {
      const res = await fetch(
        `${API_URL}/centros/${id}/usuarios`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al cargar personal");
      setPersonal(await res.json());
    } catch (e) {
      setErrorPersonal((e as Error).message);
    } finally {
      setLoadingPersonal(false);
    }
  }, [id]);

  useEffect(() => { cargarPacientes(); }, [cargarPacientes]);

  // Cargar personal solo cuando se cambia al tab de personal
  useEffect(() => { cargarPersonal(); }, [cargarPersonal]);

  // ── Reset contraseña ──
  const handleResetPassword = (trabajador: Trabajador) => {
    setTrabajadorAReset(trabajador);
  };

  const confirmarResetPassword = async () => {
    if (!trabajadorAReset) return;
    setResetingId(trabajadorAReset.usuario_id);
    try {
      const res = await fetch(
        `${API_URL}/auth/usuarios/${trabajadorAReset.usuario_id}/reset-password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al resetear");
      showToast("Contraseña reseteada correctamente.", "ok");
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setResetingId(null);
      setTrabajadorAReset(null);
    }
  };

  const handleToggleEstado = async (trabajador: Trabajador) => {
    setTogglingId(trabajador.usuario_id);
    try {
      const res = await fetch(
        `${API_URL}/centros/${id}/usuarios/${trabajador.usuario_id}/estado`,
        { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al cambiar estado");
      const { activo } = await res.json();
      setPersonal((prev) =>
        prev.map((t) => t.usuario_id === trabajador.usuario_id ? { ...t, activo } : t)
      );
      showToast(activo ? "Usuario activado." : "Usuario desactivado.", "ok");
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setTogglingId(null);
    }
  };

  const handleEliminarPaciente = async () => {
    if (!pacienteAEliminar) return;
    try {
      const res = await fetch(`${API_URL}/pacientes/${pacienteAEliminar.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Error al eliminar");
      setPacientes((prev) => prev.filter((p) => p.id !== pacienteAEliminar.id));
      showToast("Paciente eliminado correctamente.", "ok");
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setPacienteAEliminar(null);
    }
  };

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

          {/* Acción según tab activo */}
          {tab === "pacientes" ? (
            <button className="btn-primary" onClick={() => { setModalEditar("nuevo"); setAbrirEditar(true); }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Nuevo paciente
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setModalAnadirUser(true)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Añadir usuario
            </button>
          )}
        </div>

        {/* Stats (solo en tab pacientes) */}
        {tab === "pacientes" && <StatsBar pacientes={pacientes} />}

        {/* ── Tabs ── */}
        <div className="tabs">
          
          <button
            className={`tab-btn ${tab === "pacientes" ? "tab-btn--active" : ""}`}
            onClick={() => setTab("pacientes")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="4" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Pacientes
            <span className="tab-badge">{pacientes.length}</span>
          </button>
          {puedeGestionar && (
            <button
              className={`tab-btn ${tab === "personal" ? "tab-btn--active" : ""}`}
              onClick={() => setTab("personal")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1.5 12.5C1.5 10 4 8 7 8C10 8 12.5 10 12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Personal
              <span className="tab-badge">{personal.length}</span>
            </button>
          )}
        </div>

        {/* ── Contenido por tab ── */}
        {tab === "pacientes" && (
          <>
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
                userRol={user?.role ?? null}
                onEditar={(p) => { setModalEditar(p); setAbrirEditar(true); }}
                onVerNodos={(p) => setModalNodos(p)}
                onEliminar={(p) => setPacienteAEliminar(p)}
              />
            )}
          </>
        )}

        {tab === "personal" && (
          <>
            {loadingPersonal ? (
              <div className="table-loading">
                <span className="btn-spinner btn-spinner--dark" />
                Cargando personal…
              </div>
            ) : errorPersonal ? (
              <div className="table-error">{errorPersonal}</div>
            ) : (
              <PersonalTable
                personal={personalVisible}
                resetingId={resetingId}
                togglingId={togglingId}
                userRol={user?.role ?? null}
                onResetPassword={handleResetPassword}
                onToggleEstado={handleToggleEstado}
              />
            )}
          </>
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

      {modalAnadirUser && (
        <ModalAnadirUsuario
          centroId={id}
          onClose={() => setModalAnadirUser(false)}
          onGuardado={cargarPersonal}
          currentUserId={user!.id}
        />
      )}

      {pacienteAEliminar && (
        <ConfirmModal
          title="Eliminar paciente"
          message={`¿Estás seguro de que quieres eliminar a ${pacienteAEliminar.nombre} ${pacienteAEliminar.apellidos}?`}
          warn="Esta acción eliminará también todos sus árboles de decisión y no se puede deshacer."
          onConfirm={handleEliminarPaciente}
          onCancel={() => setPacienteAEliminar(null)}
        />
      )}

      {trabajadorAReset && (
        <ConfirmModal
          title="Resetear contraseña"
          message={`¿Resetear la contraseña de ${trabajadorAReset.username}?`}
          warn="Se establecerá la contraseña temporal (nombre de usuario) y el usuario deberá cambiarla al iniciar sesión."
          confirmLabel="Resetear"
          onConfirm={confirmarResetPassword}
          onCancel={() => setTrabajadorAReset(null)}
        />
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}