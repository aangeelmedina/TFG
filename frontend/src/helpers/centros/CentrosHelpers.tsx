import type { EstadoPaciente } from "../../types";

export function formatFecha(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function estadoClass(estado: EstadoPaciente): string {
    const map: Record<EstadoPaciente, string> = {
        "En tratamiento":       "badge badge--tratamiento",
        "Alta médica":          "badge badge--alta",
        "Pendiente evaluación": "badge badge--pendiente",
        "Baja temporal":        "badge badge--baja",
    };
    return map[estado] ?? "badge";
}