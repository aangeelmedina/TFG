/**
 * CONTEXTO DE AUTENTICACION
 *
 * ¿Que hace? Maneja login/logout del usuario y guarda el token JWT
 * en localStorage para que la sesion persista al recargar la pagina.
 *
 * ¿Por que un Context? Porque muchos componentes necesitan saber si el
 * usuario esta logueado (Navbar, ProtectedRoute, paginas...).
 * Sin Context tendriamos que pasar props por muchos niveles (prop drilling).
 */
import { createContext, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type { AuthResponse, User } from "../types";


// QUE datos y funciones ofrece este contexto
export interface AuthContextType {
    user: User | null; // Datos del usuario (null = no logueado)
    token: string | null; // Token JWT (null = no logueado)
    loading: boolean; // true mientras verificamos sesion al arrancar
    login: (email: string, password: string) => Promise<AuthResponse | null>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const value = useAuth();
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}