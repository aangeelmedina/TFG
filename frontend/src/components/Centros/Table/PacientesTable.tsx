import { estadoClass, formatFecha } from "../../../helpers/centros/CentrosHelpers";
import type { Paciente } from "../../../types";

interface TableProps {
    pacientes: Paciente[];
    userRol: string | null;
    onEditar: (p: Paciente) => void;
    onVerNodos: (p: Paciente) => void;
    onEliminar: (p: Paciente) => void;
    onVerResumen: (p: Paciente) => void;
}

export function PacientesTable({ pacientes, userRol, onEditar, onVerNodos, onEliminar, onVerResumen }: TableProps) {
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
                    <button className="btn btn--summary" onClick={() => onVerResumen(p)} title="Ver resumen">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2.5C4.5 2.5 2.3 4.1 1 7c1.3 2.9 3.5 4.5 6 4.5s4.7-1.6 6-4.5C11.7 4.1 9.5 2.5 7 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                        <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                        </svg>
                        Resumen
                    </button>
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
                    {userRol === "superAdmin" && (
                        <button className="btn btn--delete" onClick={() => onEliminar(p)} title="Eliminar">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2 3h9M5 3V2h3v1M3.5 3v7.5h6V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Eliminar
                        </button>
                    )}
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}