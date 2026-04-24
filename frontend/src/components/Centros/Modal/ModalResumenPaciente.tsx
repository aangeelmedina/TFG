import { useEffect, useState } from "react";
import type { Arbol, EstadisticasNodos, Paciente } from "../../../types";
import { api } from "../../../services/api";
import { formatFecha } from "../../../helpers/centros/CentrosHelpers";
import "./ModalResumenPaciente.css";

interface Props {
  paciente: Paciente;
  onClose: () => void;
}

interface ArbolResumen extends Arbol {
  num_nodos: number;
}

export function ModalResumenPaciente({ paciente, onClose }: Props) {
  const [arboles, setArboles] = useState<ArbolResumen[]>([]);
  const [stats, setStats] = useState<EstadisticasNodos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.arboles.list(paciente.id),
      api.estadisticas.get(paciente.id),
    ]).then(([arbolesRes, statsRes]) => {
      if (cancelled) return;
      if (arbolesRes.error || !arbolesRes.data) {
        setError(arbolesRes.error ?? "Error al cargar");
      } else {
        const sorted = [...(arbolesRes.data as ArbolResumen[])].sort(
          (a, b) => b.num_nodos - a.num_nodos
        );
        setArboles(sorted);
      }
      if (statsRes.data) setStats(statsRes.data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [paciente.id]);

  // Mapa arbol_id → ejecuciones totales para cruzar con la lista de árboles
  const execByArbol = Object.fromEntries(
    (stats?.por_arbol ?? []).map((a) => [a.arbol_id, a.total_ejecuciones])
  );

  // Árbol más ejecutado (por ejecuciones, no por nodos)
  const masEjecutado = stats?.por_arbol[0] ?? null;

  const totalNodos = arboles.reduce((acc, a) => acc + a.num_nodos, 0);
  // Para el KPI de árbol más complejo ordenar por nodos
  const masNodos = arboles[0] ?? null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--resumen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="resumen__header-info">
            <div className="resumen__avatar">
              {paciente.nombre[0]}
              {paciente.apellidos?.[0] ?? ""}
            </div>
            <div>
              <h3 className="modal__title">
                {paciente.nombre} {paciente.apellidos}
              </h3>
              <p className="modal__sub">
                #{paciente.id} · {paciente.estado}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="resumen__body">
          {/* Nota clínica — solo si existe */}
          {paciente.historial_medico && (
            <section className="resumen__section">
              <h4 className="resumen__section-title">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="2"
                    y="1"
                    width="10"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <line
                    x1="4.5"
                    y1="4.5"
                    x2="9.5"
                    y2="4.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4.5"
                    y1="7"
                    x2="9.5"
                    y2="7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4.5"
                    y1="9.5"
                    x2="7.5"
                    y2="9.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                Nota clínica
              </h4>
              <p className="resumen__nota">{paciente.historial_medico}</p>
            </section>
          )}

          {/* Cuerpo árboles */}
          {loading ? (
            <div className="resumen__loading">
              <span className="btn-spinner btn-spinner--dark" />
              Cargando árboles…
            </div>
          ) : error ? (
            <div className="resumen__error">{error}</div>
          ) : arboles.length === 0 ? (
            <div className="resumen__empty">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                opacity=".25"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <line
                  x1="10"
                  y1="16"
                  x2="22"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Este paciente aún no tiene árboles</span>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <section className="resumen__section">
                <h4 className="resumen__section-title">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="7"
                      width="3"
                      height="6"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="5.5"
                      y="4"
                      width="3"
                      height="9"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="10"
                      y="1"
                      width="3"
                      height="12"
                      rx="1"
                      fill="currentColor"
                    />
                  </svg>
                  Resumen de uso
                </h4>
                <div className="resumen__kpis">
                  <div className="resumen__kpi">
                    <span className="resumen__kpi-value">{arboles.length}</span>
                    <span className="resumen__kpi-label">
                      Árbol{arboles.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="resumen__kpi">
                    <span className="resumen__kpi-value">{totalNodos}</span>
                    <span className="resumen__kpi-label">Nodos totales</span>
                  </div>
                  <div className="resumen__kpi resumen__kpi--exec">
                    <span className="resumen__kpi-value">
                      {stats?.total_ejecuciones ?? 0}
                    </span>
                    <span className="resumen__kpi-label">Ejecuciones</span>
                  </div>
                  {masEjecutado ? (
                    <div className="resumen__kpi resumen__kpi--highlight">
                      <span
                        className="resumen__kpi-value resumen__kpi-value--sm"
                        title={masEjecutado.titulo}
                      >
                        {masEjecutado.titulo.length > 16
                          ? masEjecutado.titulo.slice(0, 16) + "…"
                          : masEjecutado.titulo}
                      </span>
                      <span className="resumen__kpi-label">Árbol más usado</span>
                    </div>
                  ) : masNodos ? (
                    <div className="resumen__kpi resumen__kpi--highlight">
                      <span
                        className="resumen__kpi-value resumen__kpi-value--sm"
                        title={masNodos.titulo}
                      >
                        {masNodos.titulo.length > 16
                          ? masNodos.titulo.slice(0, 16) + "…"
                          : masNodos.titulo}
                      </span>
                      <span className="resumen__kpi-label">Más complejo</span>
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Tabla de árboles */}
              <section className="resumen__section">
                <h4 className="resumen__section-title">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
                  Árboles
                </h4>

                <div className="resumen__table-wrap">
                  <table className="resumen__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Título</th>
                        <th>Nodos</th>
                        <th>Ejecuciones</th>
                        <th>Creado</th>
                        <th>Uso relativo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arboles.map((a, idx) => {
                        const exec = execByArbol[a.id] ?? 0;
                        const totalExec = stats?.total_ejecuciones ?? 0;
                        const pct = totalExec > 0 ? Math.round((exec / totalExec) * 100) : 0;
                        return (
                          <tr key={a.id}>
                            <td className="resumen__rank">
                              {idx === 0 ? (
                                <span className="resumen__rank--top">1°</span>
                              ) : (
                                `${idx + 1}°`
                              )}
                            </td>
                            <td className="resumen__arbol-titulo">{a.titulo}</td>
                            <td className="resumen__num">{a.num_nodos}</td>
                            <td className="resumen__num resumen__exec-count">
                              {exec > 0 ? (
                                <span className="resumen__exec-badge">{exec}</span>
                              ) : (
                                <span className="resumen__exec-none">—</span>
                              )}
                            </td>
                            <td className="resumen__fecha">
                              {a.creado_en ? formatFecha(a.creado_en) : "—"}
                            </td>
                            <td className="resumen__bar-cell">
                              {totalExec > 0 ? (
                                <div className="resumen__bar-wrap">
                                  <div className="resumen__bar" style={{ width: `${pct}%` }} />
                                  <span className="resumen__bar-pct">{pct}%</span>
                                </div>
                              ) : (
                                <span className="resumen__exec-none">sin datos</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Nodos finales más ejecutados */}
              {stats && stats.por_arbol.length > 0 && (
                <section className="resumen__section">
                  <h4 className="resumen__section-title">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M4.5 7.5L6.5 9.5L9.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Nodos finales más ejecutados
                  </h4>

                  <div className="resumen__table-wrap">
                    <table className="resumen__table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nodo final</th>
                          <th>Árbol</th>
                          <th>Ejecuciones</th>
                          <th>Frecuencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.por_arbol
                          .flatMap((a) =>
                            a.nodos_finales.map((n) => ({
                              ...n,
                              arbolTitulo: a.titulo,
                            }))
                          )
                          .sort((a, b) => b.veces - a.veces)
                          .slice(0, 8)
                          .map((n, idx) => {
                            const pct =
                              stats.total_ejecuciones > 0
                                ? Math.round((n.veces / stats.total_ejecuciones) * 100)
                                : 0;
                            return (
                              <tr key={`${n.nodo_id}-${idx}`}>
                                <td className="resumen__rank">
                                  {idx === 0 ? (
                                    <span className="resumen__rank--top">1°</span>
                                  ) : (
                                    `${idx + 1}°`
                                  )}
                                </td>
                                <td className="resumen__arbol-titulo">{n.texto}</td>
                                <td className="resumen__fecha resumen__arbol-ref">
                                  {n.arbolTitulo}
                                </td>
                                <td className="resumen__num">
                                  <span className="resumen__exec-badge">{n.veces}</span>
                                </td>
                                <td className="resumen__bar-cell">
                                  <div className="resumen__bar-wrap">
                                    <div
                                      className="resumen__bar resumen__bar--green"
                                      style={{ width: `${pct}%` }}
                                    />
                                    <span className="resumen__bar-pct">{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
