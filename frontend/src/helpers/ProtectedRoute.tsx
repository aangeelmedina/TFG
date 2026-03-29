import { use, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"


interface ProtectedRouteProps{
    children: ReactNode
}

const ProtectedRoute = ({ children }:ProtectedRouteProps) => {
    const { user, loading } = use(AuthContext)!;

    if (loading) return (
        <div className="cl-state">
            <span className="cl-spinner" />
            <span>Cargando centros…</span>
        </div>
    );

    if(!user){
        return <Navigate to="/login" replace/>
    }
    return (
        <>{children}</>
    )
}

export default ProtectedRoute