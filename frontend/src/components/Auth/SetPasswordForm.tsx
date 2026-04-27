import { use, useActionState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import "./LoginForm.css";

const SetPasswordForm = () => {
    const { checkAuth } = use(AuthContext)!;
    const navigate = useNavigate();

    const formAction = async (
        _prev: { error: string | null },
        formData: FormData,
    ) => {
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!newPassword || !confirmPassword) {
            return { error: "Ambos campos de contraseña son requeridos" };
        }

        if (newPassword.length < 8) {
            return { error: "La contraseña debe tener al menos 8 caracteres" };
        }

        if (newPassword !== confirmPassword) {
            return { error: "Las contraseñas no coinciden" };
        }

        try {
            await authAPI.setPassword(newPassword);
            // Actualizar el usuario en el contexto para reflejar que cambió la contraseña
            await checkAuth();
            navigate("/home");
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al cambiar la contraseña";
            return { error: message };
        }
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
                <h2 className="lf-title">Cambiar Contraseña</h2>
                <p className="lf-sub">Es tu primer acceso, por favor establece una nueva contraseña</p>
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
                    <label className="lf-label">Nueva Contraseña</label>
                    <div className="lf-input-wrap">
                        <svg className="lf-input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <rect x="2" y="6.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                        </svg>
                        <input
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="lf-input"
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="lf-field">
                    <label className="lf-label">Confirmar Contraseña</label>
                    <div className="lf-input-wrap">
                        <svg className="lf-input-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <rect x="2" y="6.5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                        </svg>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="lf-input"
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <button type="submit" disabled={isPending} className="lf-submit">
                    {isPending ? (
                        <>
                            <span className="lf-spinner" />
                            Cambiando…
                        </>
                    ) : (
                        <>
                            Cambiar Contraseña
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

export default SetPasswordForm;
