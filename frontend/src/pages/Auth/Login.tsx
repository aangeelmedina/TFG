import { use } from "react";
import LoginForm from "../../components/Auth/LoginForm";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const { user } = use(AuthContext)!;

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="login-page">
            <LoginForm />
        </div>
    );
};

export default Login;