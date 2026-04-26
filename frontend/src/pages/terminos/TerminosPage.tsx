import { useNavigate } from "react-router-dom";
import "./TerminosPage.css";

const TerminosPage = () => {
    const navigate = useNavigate();

    return (
        <div className="tp-page">
            <div className="tp-container">
                <button className="tp-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Volver
                </button>

                <header className="tp-header">
                    <div className="tp-brand">
                        <span className="tp-brand__dot" />
                        <span className="tp-brand__name">Nexa Solutions</span>
                    </div>
                    <h1 className="tp-title">Términos y Condiciones de Uso</h1>
                    <p className="tp-date">Última actualización: 26 de abril de 2026</p>
                </header>

                <div className="tp-body">
                    <section className="tp-section">
                        <h2>1. Aceptación de los términos</h2>
                        <p>
                            Al acceder y utilizar la plataforma <strong>Nexa Solutions</strong>, usted acepta quedar
                            vinculado por estos Términos y Condiciones de Uso, así como por todas las leyes y
                            normativas aplicables. Si no está de acuerdo con alguno de estos términos, queda
                            expresamente prohibido el uso de esta plataforma y deberá suspender su acceso de
                            inmediato.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>2. Descripción del servicio</h2>
                        <p>
                            Nexa Solutions es una plataforma de gestión clínica y rehabilitación que permite a
                            profesionales sanitarios autorizados gestionar centros, pacientes, tratamientos y
                            árboles de decisión terapéuticos. El acceso está restringido a personal autorizado
                            con credenciales válidas.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>3. Uso autorizado</h2>
                        <p>El usuario se compromete a:</p>
                        <ul>
                            <li>Utilizar la plataforma exclusivamente para los fines profesionales para los que fue habilitado.</li>
                            <li>Mantener la confidencialidad de sus credenciales de acceso y no compartirlas con terceros.</li>
                            <li>No intentar acceder a datos de pacientes o secciones para los que no tenga autorización expresa.</li>
                            <li>Notificar de inmediato cualquier uso no autorizado de su cuenta al administrador del sistema.</li>
                            <li>Garantizar que la información introducida en el sistema es verídica y actualizada.</li>
                        </ul>
                    </section>

                    <section className="tp-section">
                        <h2>4. Protección de datos personales</h2>
                        <p>
                            Esta plataforma trata datos de carácter personal conforme al <strong>Reglamento (UE)
                            2016/679 (RGPD)</strong> y la <strong>Ley Orgánica 3/2018 de Protección de Datos
                            Personales y garantía de los derechos digitales (LOPDGDD)</strong>. Los datos de
                            pacientes son especialmente sensibles (datos de salud) y están sujetos a medidas de
                            seguridad reforzadas.
                        </p>
                        <p>
                            El usuario actúa como encargado del tratamiento respecto a los datos de los pacientes
                            que gestione, y está obligado a respetar en todo momento la normativa de protección
                            de datos vigente.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>5. Confidencialidad</h2>
                        <p>
                            Toda la información a la que el usuario acceda a través de esta plataforma, incluidos
                            historiales médicos, datos de contacto, diagnósticos y planes de tratamiento, tiene
                            carácter estrictamente confidencial. El usuario se compromete a:
                        </p>
                        <ul>
                            <li>No divulgar información de pacientes a personas no autorizadas.</li>
                            <li>No extraer, copiar ni exportar datos fuera de los cauces autorizados por la organización.</li>
                            <li>Respetar el secreto profesional incluso tras la finalización de la relación laboral.</li>
                        </ul>
                    </section>

                    <section className="tp-section">
                        <h2>6. Seguridad de la cuenta</h2>
                        <p>
                            El usuario es responsable de mantener la seguridad de su cuenta. Debe utilizar una
                            contraseña robusta, no reutilizar contraseñas de otros servicios y cerrar sesión al
                            finalizar su jornada o al abandonar un dispositivo compartido. Nexa Solutions no será
                            responsable de los daños derivados del incumplimiento de estas medidas.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>7. Propiedad intelectual</h2>
                        <p>
                            Todos los contenidos de la plataforma, incluyendo su diseño, código fuente, algoritmos
                            de los árboles de decisión y documentación, son propiedad exclusiva de Nexa Solutions
                            o de sus licenciantes. Queda prohibida su reproducción, distribución o modificación sin
                            autorización expresa por escrito.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>8. Limitación de responsabilidad</h2>
                        <p>
                            Nexa Solutions no garantiza que la plataforma esté disponible de forma ininterrumpida
                            ni libre de errores. En ningún caso la empresa será responsable de daños indirectos,
                            incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio.
                            Las decisiones clínicas adoptadas a partir de la información proporcionada por la
                            plataforma son responsabilidad exclusiva del profesional sanitario.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>9. Modificaciones de los términos</h2>
                        <p>
                            Nexa Solutions se reserva el derecho de modificar estos Términos y Condiciones en
                            cualquier momento. Los cambios serán comunicados a través de la plataforma y entrarán
                            en vigor en el momento de su publicación. El uso continuado del servicio tras la
                            publicación de cambios implica la aceptación de los nuevos términos.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>10. Ley aplicable y jurisdicción</h2>
                        <p>
                            Estos Términos se rigen por la legislación española. Para la resolución de cualquier
                            controversia derivada de su interpretación o cumplimiento, las partes se someten a
                            los Juzgados y Tribunales de España, con renuncia expresa a cualquier otro fuero que
                            pudiera corresponderles.
                        </p>
                    </section>

                    <section className="tp-section">
                        <h2>11. Contacto</h2>
                        <p>
                            Para cualquier consulta relativa a estos Términos o al tratamiento de sus datos,
                            puede contactar con el equipo de Nexa Solutions a través del administrador de su
                            centro o mediante los canales habilitados internamente.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TerminosPage;
