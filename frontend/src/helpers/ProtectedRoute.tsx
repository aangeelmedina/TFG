import { use, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"


interface ProtectedRouteProps{
    children: ReactNode
}

const ProtectedRoute = ({ children }:ProtectedRouteProps) => {
    const { user, loading } = use(AuthContext)!;
    const location = useLocation();

    if (loading) return (
        <div className="cl-state">
            <span className="cl-spinner" />
            <span>Cargando centros…</span>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.setPassword && location.pathname !== "/set-password") {
        return <Navigate to="/set-password" replace />
    }

    return (
        <>{children}</>
    )
}

export default ProtectedRoute