
import { createContext, type ReactNode } from "react";
import type { Centro, CreateCentroDTO } from "../types";
import { useCentros } from "../hooks/useCentros";



// QUE datos y funciones ofrece este contexto
export interface CentrsoContextType {
    centros: Centro[];
    loading: boolean;
    error: string | null;
    fetchCentros(userId: number):Promise<void>;
    deleteById(id: number):Promise<void>;
    createCentros(centro:CreateCentroDTO):Promise<void>
}

export const CentrosContext = createContext<CentrsoContextType | undefined>(undefined);

export function CentrosProvider({ children }: { children: ReactNode }) {
    const value = useCentros();
    return <CentrosContext.Provider value={value}>{children}</CentrosContext.Provider>;
}