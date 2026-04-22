

export interface User {
    id: number;
    role: string | null;
    username: string;
    setPassword: boolean;
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

export interface Nodo {
    id: number;
    texto: string;
    img: string | null;
    es_final: boolean;
    padre_id: number | null;
    arbol_id: number;
    hijos: Nodo[];
}

export interface Arbol {
    id: number;
    titulo: string;
    paciente_id: number;
    creado_en: string | null;
    num_nodos: number;
    raiz?: Nodo | null;
}

export interface Paciente {
    id: number;
    nombre: string;
    apellidos: string;
}

export interface NodoPaciente {
    id: number;
    nombre: string;
    apellidos: string;
}

// Nodo simplificado que devuelve /jugar
export interface NodoJuego {
    id: number;
    texto: string;
    es_final: boolean;
    nivel: number;
    num_hijos: number;
    hijos: { id: number; texto: string; es_final: boolean }[];
}

export type Vista =
    | { tipo: "lista" }
    | { tipo: "editor"; arbol: Arbol }
    | { tipo: "juego";  arbol: Arbol };

// ─── Toast ────────────────────────────────────────────────
export type ToastState = { msg: string; type: "ok" | "err" } | null;

export type ModalState = Paciente | "nuevo" | null;
export type Tab = "pacientes" | "personal";

export interface Trabajador {
  id: number;          // id de la asignación (CentroUsuario)
  usuario_id: number;
  username: string;
  rol: string;
  activo: boolean;
}