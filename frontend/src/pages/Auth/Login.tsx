import { use } from "react";
import LoginForm from "../../components/Auth/LoginForm";
import TermsModal from "../../components/Auth/TermsModal";
import { AuthContext } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import "./Login.css";

const TERMS_KEY = (userId: number) => `terms_accepted_${userId}`;

const Login = () => {
    const { user, logout } = use(AuthContext)!;
    const navigate = useNavigate();

    if (user) {
        const termsAccepted = !!localStorage.getItem(TERMS_KEY(user.id));

        if (termsAccepted) {
            return <Navigate to="/home" replace />;
        }

        const handleAccept = () => {
            localStorage.setItem(TERMS_KEY(user.id), "true");
            navigate("/home");
        };

        const handleDecline = () => {
            logout();
        };

        return (
            <div className="login-page">
                <LoginForm />
                <TermsModal onAccept={handleAccept} onDecline={handleDecline} />
            </div>
        );
    }

    return (
        <div className="login-page">
            <LoginForm />
        </div>
    );
};

export default Login;