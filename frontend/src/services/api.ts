import type { Arbol, AuthResponse, Centro, CreateCentroDTO, EstadisticasNodos, MessageResponse, Nodo, NodoJuego, User } from "../types";



// Si VITE_API_URL es "" (Docker local con nginx), las llamadas son relativas y
// nginx las proxia al backend. Si no está definida, fallback a localhost para
// desarrollo sin Docker.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
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
    async register(username: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ username }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Error al crear el usuario");
        }
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
    async setPassword(newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/auth/set-password`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ password: newPassword }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Error al cambiar la contraseña");
        }
        return response.json();
    },
};

// ========================================
// Nodos, árboles, pacientes... (NODES, TREES, PATIENTS...)
// ========================================

async function apiFetch<T>(
  url: string,
  opts: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? `HTTP ${res.status}` };
    return { data: json as T };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

const API = import.meta.env.VITE_API_URL;

export const api = {
    arboles: {
        list:   (pid: number) => apiFetch<Arbol[]>(`${API}/api/pacientes/${pid}/arboles`),
        get:    (pid: number, aid: number) => apiFetch<Arbol>(`${API}/api/pacientes/${pid}/arboles/${aid}`),
        create: (pid: number, titulo: string) =>
        apiFetch<Arbol>(`${API}/api/pacientes/${pid}/arboles`, {
            method: "POST",
            body: JSON.stringify({ titulo }),
        }),
        rename: (pid: number, aid: number, titulo: string) =>
        apiFetch<Arbol>(`${API}/pacientes/${pid}/arboles/${aid}`, {
            method: "PATCH",
            body: JSON.stringify({ titulo }),
        }),
        delete: (pid: number, aid: number) =>
        apiFetch<{ eliminado: number }>(`${API}/api/pacientes/${pid}/arboles/${aid}`, {
            method: "DELETE",
        }),
    },
    nodos: {
        create: (pid: number, aid: number, padre_id: number, texto: string, es_final: boolean) =>
        apiFetch<Nodo>(`${API}/api/pacientes/${pid}/arboles/${aid}/nodos`, {
            method: "POST",
            body: JSON.stringify({ padre_id, texto, es_final }),
        }),
        edit: (pid: number, aid: number, nid: number, fields: Partial<Pick<Nodo, "texto" | "es_final">>) =>
        apiFetch<Nodo>(`${API}/api/pacientes/${pid}/arboles/${aid}/nodos/${nid}`, {
            method: "PATCH",
            body: JSON.stringify(fields),
        }),
        delete: (pid: number, aid: number, nid: number) =>
        apiFetch<{ eliminado: number }>(`${API}/api/pacientes/${pid}/arboles/${aid}/nodos/${nid}`, {
            method: "DELETE",
        }),
    },
    juego: {
    // Obtiene un nodo para jugar; sin nodo_id = raíz
        getNodo: (pid: number, aid: number, nodo_id?: number) => {
            const qs = nodo_id !== undefined ? `?nodo_id=${nodo_id}` : "";
            return apiFetch<NodoJuego>(`${API}/api/pacientes/${pid}/arboles/${aid}/jugar${qs}`);
        },
    },
    ejecuciones: {
        registrar: (pid: number, aid: number, nid: number) =>
            apiFetch<{ id: number }>(`${API}/api/pacientes/${pid}/arboles/${aid}/nodos/${nid}/ejecutar`, {
                method: "POST",
            }),
    },
    estadisticas: {
        get: (pid: number) =>
            apiFetch<EstadisticasNodos>(`${API}/api/pacientes/${pid}/estadisticas/nodos`),
    },
}