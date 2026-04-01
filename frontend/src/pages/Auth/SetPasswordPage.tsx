import { use, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SetPasswordForm from "../../components/Auth/SetPasswordForm";
import "../Auth/Login.css";

const SetPasswordPage = () => {
    const { user, loading } = use(AuthContext)!;
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            // Si no está logueado, ir a login
            if (!user) {
                navigate("/login");
            }
            // Si está logueado pero ya cambió la contraseña, ir a home
            else if (!user.setPassword) {
                navigate("/home");
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <div>Cargando...</div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <SetPasswordForm />
            </div>
        </div>
    );
};

export default SetPasswordPage;
