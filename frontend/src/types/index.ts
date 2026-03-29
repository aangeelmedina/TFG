

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