// centros: Centro[];
//     loading: boolean;
//     error: string | null;
//     fetchCentros(search?: string):Promise<void>;
//     deleteById(id: number):Promise<void>;
//     createCentros(centro:CreateCentroDTO):Promise<void>

import { use, useEffect, useState } from "react";
import type { Centro, CreateCentroDTO } from "../types";
import { centrosAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export const useCentros = () =>{
    const [centros, setCentros] = useState<Centro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = use(AuthContext)!;

    // LEER - Pide todas los centros al backend
    const fetchCentros = async () => {
        setLoading(true);
        setError(null);
        try {
            if(!user){
                throw new Error("Error al hacer fetch de centros")
            }
            const data = await centrosAPI.getCentros(user.id);
            setCentros(data)
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error al cargar empresas";
            setError(message);
        } finally {
            setLoading(false);
        }
    };



    // ELIMINAR - Envia al backend y la quita del array local
    const deleteById = async (id: number): Promise<void> => {
        try {
        centrosAPI.deleteCentro(id);
        // .filter devuelve un nuevo array SIN la empresa eliminada
        setCentros((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
        const message = err instanceof Error ? err.message : "Error al eliminar empresa";
        console.log(message)
        }
    };

    // CREAR - Envia al backend y la añade al array local
    const createCentros = async (centro: CreateCentroDTO): Promise<void> => {
        try {
            const nuevoCentro = await centrosAPI.createCentro(centro);
            console.log("nuevo centro:", nuevoCentro);
            setCentros((prev) => [...prev, nuevoCentro.centro]); 
            // Si el backend devuelve el centro creado con ID, lo añadimos al array local
            // setCentros((prev) => [...prev, response]);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al crear empresa";
            console.log(message)
        }
    }
    // useEffect con [] = se ejecuta UNA vez al montar.
    // "Cuando este componente aparece, carga las empresas del backend"
    useEffect(() => {
        if (user?.id) {
            fetchCentros();
        }
    }, [user?.id]);

    return {centros,loading,error,fetchCentros,deleteById,createCentros}

}