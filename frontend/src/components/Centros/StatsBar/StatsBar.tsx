import type { Paciente } from "../../../types";

export function StatsBar({ pacientes }: { pacientes: Paciente[] }) {
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