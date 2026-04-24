import { use, useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CentrosContext } from "../../context/CentrosContext";
import { authAPI } from "../../services/api";
import type { CreateCentroDTO } from "../../types";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = use(AuthContext)!;
    const navigate = useNavigate();
    const centrosContext = useContext(CentrosContext);
    const { createCentros } = centrosContext || {};

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Cierra el menú móvil al hacer clic fuera
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    // Cierra el menú móvil al cambiar de ruta
    useEffect(() => { setMobileMenuOpen(false); }, []);
    const [formData, setFormData] = useState<CreateCentroDTO>({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
    });
    const [userFormData, setUserFormData] = useState({ username: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createCentros) return;

        setLoading(true);
        try {
            await createCentros({ ...formData, user: user!.id });
            setIsModalOpen(false);
            setFormData({ nombre: '', direccion: '', telefono: '', email: '' });
        } catch (error) {
            const message = (error as Error).message || "Error al conectar con el servidor";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.register(userFormData.username);
            setIsUserModalOpen(false);
            setUserFormData({ username: '' });
        } catch (error) {
            const message = (error as Error).message || "Error al conectar con el servidor";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <nav className="navbar" ref={mobileMenuRef}>
                {/* Brand */}
                <button onClick={() => navigate("/home")} className="navbar__brand-btn">
                    <span className="navbar__brand">
                        <span className="navbar__brand-dot" />
                        Nexa Solutions
                    </span>
                </button>

                {/* Desktop actions */}
                <div className="navbar__actions navbar__actions--desktop">
                    {/* User chip */}


                    {user?.role === "superAdmin" && (
                        <div className="navbar__actions">
                            <button className="navbar__btn navbar__btn--primary" onClick={() => setIsUserModalOpen(true)}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Crear Usuario
                            </button>
                            <button className="navbar__btn navbar__btn--primary" onClick={() => setIsModalOpen(true)}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Crear Centro
                            </button>
                        </div>
                    )}

                    {user && (
                        <button className="navbar__btn navbar__btn--ghost" onClick={() => logout()}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M9 4.5L12 7l-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Cerrar sesión
                        </button>
                    )}
                </div>

                {/* Hamburger button — solo visible en móvil */}
                {user && (
                    <button
                        className={`navbar__hamburger${mobileMenuOpen ? " navbar__hamburger--open" : ""}`}
                        onClick={() => setMobileMenuOpen(o => !o)}
                        aria-label="Menú"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className="navbar__hamburger-bar" />
                        <span className="navbar__hamburger-bar" />
                        <span className="navbar__hamburger-bar" />
                    </button>
                )}

                {/* Menú móvil desplegable */}
                {mobileMenuOpen && (
                    <div className="navbar__mobile-menu">

                        {user?.role === "superAdmin" && (
                            <>
                                <button
                                    className="navbar__mobile-item"
                                    onClick={() => { setMobileMenuOpen(false); setIsUserModalOpen(true); }}
                                >
                                    <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
                                        <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Crear Usuario
                                </button>
                                <button
                                    className="navbar__mobile-item"
                                    onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }}
                                >
                                    <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
                                        <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Crear Centro
                                </button>
                            </>
                        )}

                        {user && (
                            <button
                                className="navbar__mobile-item navbar__mobile-item--logout"
                                onClick={() => { setMobileMenuOpen(false); logout(); }}
                            >
                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                                    <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M9 4.5L12 7l-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Cerrar sesión
                            </button>
                        )}
                    </div>
                )}
            </nav>

            {/* Modal Crear Centro */}
            {isModalOpen && (
                <div className="nb-modal-overlay" onClick={() => !loading && setIsModalOpen(false)}>
                    <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nb-modal__header">
                            <div>
                                <h2 className="nb-modal__title">Crear nuevo centro</h2>
                                <p className="nb-modal__sub">Rellena los datos del centro sanitario</p>
                            </div>
                            <button
                                className="nb-modal__close"
                                onClick={() => setIsModalOpen(false)}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>

                        <form className="nb-modal__form" onSubmit={handleSubmit}>
                            <div className="nb-form-grid">
                                <div className="nb-field">
                                    <label className="nb-label">Nombre</label>
                                    <input
                                        className="nb-input"
                                        type="text"
                                        name="nombre"
                                        placeholder="Centro Sanitario …"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="nb-field">
                                    <label className="nb-label">Dirección</label>
                                    <input
                                        className="nb-input"
                                        type="text"
                                        name="direccion"
                                        placeholder="Calle, número, ciudad"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="nb-field">
                                    <label className="nb-label">Teléfono</label>
                                    <input
                                        className="nb-input"
                                        type="text"
                                        name="telefono"
                                        placeholder="+34 6XX XXX XXX"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="nb-field">
                                    <label className="nb-label">Email</label>
                                    <input
                                        className="nb-input"
                                        type="email"
                                        name="email"
                                        placeholder="contacto@centro.es"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="nb-modal__footer">
                                <button
                                    type="button"
                                    className="nb-btn nb-btn--cancel"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="nb-btn nb-btn--save"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="nb-spinner" />
                                            Guardando…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <path d="M2 7L5 10L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Crear Usuario */}
            {isUserModalOpen && (
                <div className="nb-modal-overlay" onClick={() => !loading && setIsUserModalOpen(false)}>
                    <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="nb-modal__header">
                            <div>
                                <h2 className="nb-modal__title">Crear nuevo usuario</h2>
                                <p className="nb-modal__sub">Introduce el nombre de usuario</p>
                            </div>
                            <button
                                className="nb-modal__close"
                                onClick={() => setIsUserModalOpen(false)}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>

                        <form className="nb-modal__form" onSubmit={handleUserSubmit}>
                            <div className="nb-form-grid">
                                <div className="nb-field">
                                    <label className="nb-label">Username</label>
                                    <input
                                        className="nb-input"
                                        type="text"
                                        name="username"
                                        placeholder="nombre_usuario"
                                        value={userFormData.username}
                                        onChange={handleUserChange}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="nb-modal__footer">
                                <button
                                    type="button"
                                    className="nb-btn nb-btn--cancel"
                                    onClick={() => setIsUserModalOpen(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="nb-btn nb-btn--save"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="nb-spinner" />
                                            Guardando…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <path d="M2 7L5 10L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;