import { useEffect, useState } from "react";
import { authAPI } from "../services/api";
import type { User } from "../types";

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    // Leemos token de localStorage al iniciar → si el usuario recarga, sigue ahi
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("token"),
    );
    // loading = true al inicio para evitar un "flash" de redireccion a /login
    // mientras verificamos si el token guardado sigue siendo valido
    const [loading, setLoading] = useState(true);

    const login = async (email:string,password:string): Promise<boolean> => {
        try {
            const response = await authAPI.login(email,password);
            setUser(response.user);
            setToken(response.token);
            localStorage.setItem("token", response.token);
            return true
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al iniciar sesion";
            console.log(message)
            return false
        }
    };


    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    // checkAuth: verifica si el token de localStorage sigue siendo valido
    // Llama a GET /auth/me → si OK, el token vale → si error, hacemos logout
    const checkAuth = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await authAPI.getMe(); 
            setUser(response);
        } catch (err) {
            console.error("checkAuth falló:", err); 
            logout();
        } finally {
            setLoading(false);
        }
    };

    // useEffect con [] = se ejecuta UNA vez al montar el componente
    // "Al abrir la app, comprueba si ya estoy logueado de antes"
    useEffect(() => {
        checkAuth();
    }, []);

    return {
        user,
        token,
        loading,
        // !!user convierte objeto a boolean:
        //   user = null   → !!null = false  (no autenticado)
        //   user = {..}   → !!obj  = true   (autenticado)
        // Es lo mismo que: user !== null
        login,
        logout,
        checkAuth,
    };
} 