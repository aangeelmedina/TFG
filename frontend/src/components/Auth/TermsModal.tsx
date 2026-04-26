import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TermsModal.css";

interface TermsModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

const TermsModal = ({ onAccept, onDecline }: TermsModalProps) => {
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="tm-overlay">
            <div className="tm-modal" role="dialog" aria-modal="true" aria-labelledby="tm-title">
                <div className="tm-header">
                    <div className="tm-brand">
                        <span className="tm-brand__dot" />
                        <span className="tm-brand__name">Nexa Solutions</span>
                    </div>
                    <h2 className="tm-title" id="tm-title">Términos y Condiciones de Uso</h2>
                    <p className="tm-subtitle">
                        Antes de continuar, revisa y acepta nuestros términos de uso.
                    </p>
                </div>

                <div className="tm-body">
                    <div className="tm-scroll">
                        <section className="tm-section">
                            <h3>1. Uso autorizado</h3>
                            <p>
                                Esta plataforma está destinada exclusivamente a profesionales sanitarios
                                autorizados. El acceso y uso de la misma implica el compromiso de utilizarla
                                únicamente para los fines profesionales para los que fue habilitada.
                            </p>
                        </section>

                        <section className="tm-section">
                            <h3>2. Confidencialidad de datos</h3>
                            <p>
                                Toda la información gestionada a través de esta plataforma, especialmente los
                                datos de pacientes (historiales médicos, diagnósticos, tratamientos), tiene
                                carácter estrictamente confidencial. Queda prohibida su divulgación a personas
                                no autorizadas.
                            </p>
                        </section>

                        <section className="tm-section">
                            <h3>3. Protección de datos (RGPD)</h3>
                            <p>
                                El tratamiento de datos personales se realiza conforme al Reglamento (UE)
                                2016/679 (RGPD) y la LOPDGDD. El usuario actúa como encargado del tratamiento
                                y es responsable de cumplir la normativa vigente en materia de protección de datos.
                            </p>
                        </section>

                        <section className="tm-section">
                            <h3>4. Seguridad de la cuenta</h3>
                            <p>
                                El usuario es responsable de mantener la seguridad de sus credenciales. No debe
                                compartir su contraseña y debe cerrar sesión al finalizar el uso en dispositivos
                                compartidos.
                            </p>
                        </section>

                        <section className="tm-section">
                            <h3>5. Responsabilidad clínica</h3>
                            <p>
                                Las decisiones clínicas adoptadas a partir de la información proporcionada por
                                la plataforma son responsabilidad exclusiva del profesional sanitario. Nexa
                                Solutions no asume responsabilidad por los resultados derivados de dichas
                                decisiones.
                            </p>
                        </section>

                        <div className="tm-full-link">
                            <button
                                type="button"
                                className="tm-link-btn"
                                onClick={() => navigate("/terminos")}
                            >
                                Leer los términos y condiciones completos
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <path d="M2 6.5h9M7.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="tm-footer">
                    <label className="tm-checkbox-label">
                        <input
                            type="checkbox"
                            className="tm-checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                        />
                        <span className="tm-checkbox-custom" />
                        <span>He leído y acepto los Términos y Condiciones de Uso</span>
                    </label>

                    <div className="tm-actions">
                        <button type="button" className="tm-btn-decline" onClick={onDecline}>
                            Rechazar
                        </button>
                        <button
                            type="button"
                            className="tm-btn-accept"
                            disabled={!checked}
                            onClick={onAccept}
                        >
                            Aceptar y continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
