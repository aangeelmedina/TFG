import type { AuthResponse, Centro, CreateCentroDTO, MessageResponse, User } from "../types";



// [companies]
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
// const BASE_URL = import.meta.env.VITE_BASE_URL

/**
 * Helper para obtener headers con token si existe
 */
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Si hay token en localStorage, añadirlo al header
    const token = localStorage.getItem("token");
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// ========================================
// EMPRESAS (COMPANIES)
// ========================================

export const centrosAPI = {
    /**
     * Obtener todas las empresas
     */
    async getCentros(userId: number): Promise<Centro[]> {
        // 1. Apuntamos al endpoint correcto y pasamos el user_id si existe
        const url = `${API_URL}/centros?user_id=${userId}` 

        const response = await fetch(url, {
            headers: getHeaders(), // 🔥 Asegúrate de que esto envía el token de sesión
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: "Error desconocido" }));
            throw new Error(error.message || `Error ${response.status}`);
        }

        return response.json();
    },

    /**
     * Obtener una empresa por ID
    */
    // async getCentroById(id: number): Promise<GameDetail> {
    //     const response = await fetch(`${API_URL}/games/${id}`, {
    //     headers: getHeaders(),
    //     });
    //     if (!response.ok) {
    //     const error = await response
    //         .json()
    //         .catch(() => ({ message: "Error desconocido" }));
    //     throw new Error(error.message || `Error ${response.status}`);
    //     }
    //     return response.json();
    // },


    /**
     * Eliminar una empresa
     */
    async deleteCentro(id: number): Promise<MessageResponse> {
        const response = await fetch(`${API_URL}/centro/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
        });
        if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: "Error desconocido" }));
        throw new Error(error.message || `Error ${response.status}`);
        }
        return response.json();
    },

    /**
     * Crear un centro
     */

    async createCentro(centro: CreateCentroDTO) {
        const response = await fetch(`${API_URL}/centros/añadir`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(centro),
        });
        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: "Error desconocido" }));
            throw new Error(error.message || `Error ${response.status}`);
        }
        return response.json();
    },
}

// ========================================
// USUARIOS (USERS)
// ========================================

export const authAPI = {
    async login(email:string, password:string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({email,password}),
        });
        if (!response.ok) {
        throw new Error("Error al iniciar sesión");
        }
        return response.json();
    },
    async getMe(): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
        });
        if (!response.ok) {
        throw new Error("Error al obtener información del usuario");
        }
        return response.json();
    },
};