

export interface User {
    id: number;
    role: string | null;
    username: string;
}

export interface LoginProps{
    setIsAllowed: (allowed: boolean) => void;
}

// src/types/index.ts

// Interfaz base para un Centro (tal como viene de la BD)
export interface Centro {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    admin_id?: number | null;
    user?: number | null; // Agregado para enviar el ID del usuario al crear un centro
}

// DTO (Data Transfer Object): Lo que enviamos para crear un centro (no tiene ID aún)
// "Omit" crea un tipo nuevo quitando 'id' y 'admin_id' de la interfaz Centro
export type CreateCentroDTO = Omit<Centro, 'id' | 'admin_id'>;

// Interfaz para la respuesta de error de tu API
export interface ApiError {
    message: string;
    status: number;
}

/** Respuesta de POST /auth/login */
export interface AuthResponse {
    user: User;
    token: string;
}

/** Respuesta genérica de operaciones: favoritos, eliminar... */
export interface MessageResponse {
    message: string;
}

export type EstadoPaciente =
    | "En tratamiento"
    | "Alta médica"
    | "Pendiente evaluación"
    | "Baja temporal";

export interface Paciente {
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

export type PacienteForm = Omit<Paciente, "id" | "centro_id">;

// ─── Types ────────────────────────────────────────────────────────────────────


export const ESTADO_OPCIONES: EstadoPaciente[] = [
  "En tratamiento",
  "Alta médica",
  "Pendiente evaluación",
  "Baja temporal",
];

export const FORM_VACIO: PacienteForm = {
    nombre: "",
    apellidos: "",
    dni: "",
    edad: 0,
    contacto: "",
    historial_medico: "",
    estado: "En tratamiento",
    fecha_ingreso: "",
};