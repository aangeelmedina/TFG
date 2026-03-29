import React, { useState } from "react";
import "./NodosPage.css";
import type { Arbol, Paciente } from "../../types";
import { ArbolesListView } from "../../components/Nodos/VistaListaDeArboles/ArbolesListView";
import { ArbolEditorView } from "../../components/Nodos/VistaEditorDeArboles/ArbolEditorView";


// ══════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL — orquesta las dos vistas
// ══════════════════════════════════════════════════════════

/**
 * Props que recibirá esta página cuando la abras desde CentroAdminPage.
 * Pásale el paciente seleccionado y un callback para volver al listado.
 */
interface NodosPageProps {
    paciente: Paciente;
    onBack: () => void;
}

const NodosPage: React.FC<NodosPageProps> = ({ paciente, onBack }) => {
    const [arbolSeleccionado, setArbolSeleccionado] = useState<Arbol | null>(null);

    if (arbolSeleccionado) {
        return (
        <ArbolEditorView
            paciente={paciente}
            arbolMeta={arbolSeleccionado}
            onBack={() => setArbolSeleccionado(null)}
        />
        );
    }

    return (
        <ArbolesListView
        paciente={paciente}
        onSelectArbol={setArbolSeleccionado}
        onBack={onBack}
        />
    );
};

export default NodosPage;