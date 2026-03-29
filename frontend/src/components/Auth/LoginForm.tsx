import { use, useActionState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
    const { login }  = use(AuthContext)!;
    const navigate   = useNavigate();

    const formAction = async (
        _prev: { error: string | null },
        formData: FormData,
    ) => {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (!username || !password) {
            return { error: "El usuario y la contraseña son requeridos" };
        }

        const success = await login(username, password);
        if (!success) return { error: "Credenciales incorrectas" };

        navigate("/home");
        return { error: null };
    };

    const [state, handleSubmit, isPending] = useActionState(formAction, { error: null });

    return (
        <div className="lf-card">
            {/* Brand mark */}
            <div className="lf-brand">
                <span className="lf-brand__dot" />
                <span className="lf-brand__name">Nexa Solutions</span>
            </div>

            <div className="lf-header">
                <h2 className="lf-title">Bienvenido</h2>
                <p className="lf-sub">Introduce tus credenciales para continuar</p>
            </div>

            <form action={handleSubmit} className="lf-form">
                {state.error && (
                    <div className="lf-alert">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                            <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="7" cy="9.5" r="0.7" fill="currentColor"/>
                        </svg>
                        {state.error}
                    </div>
                )}

                <div className="lf-field">
                    <label className="lf-label">Usuario</label>
                    <div className="lf-input-wrap">
                        <svg className="lf-input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M1.5 13.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input
                            name="username"
                            type="text"
                            placeholder="Usuario123"
                            required
                            className="lf-input"
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="lf-field">
                    <label className="lf-label">Contraseña</label>
                    <div className="lf-input-wrap">
                        <svg className="lf-input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <rect x="2" y="6.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                        </svg>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="lf-input"
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <button type="submit" disabled={isPending} className="lf-submit">
                    {isPending ? (
                        <>
                            <span className="lf-spinner" />
                            Ingresando…
                        </>
                    ) : (
                        <>
                            Iniciar sesión
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;