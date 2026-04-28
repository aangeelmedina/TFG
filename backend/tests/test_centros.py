# tests/test_centros.py
import pytest
import sys
from unittest.mock import MagicMock, patch


# ── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def mock_clases_module():
    mock_clases = MagicMock()
    sys.modules["clases"] = mock_clases
    yield mock_clases


@pytest.fixture
def app(mock_clases_module):
    from flask import Flask
    from flask_jwt_extended import JWTManager

    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret"
    JWTManager(app)

    from Centros.centrosController import centros_bp
    app.register_blueprint(centros_bp)

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def super_admin():
    u = MagicMock()
    u.id = 1
    u.username = "admin"
    u.rol = "superAdmin"
    return u


@pytest.fixture
def usuario_normal():
    u = MagicMock()
    u.id = 2
    u.username = "juan"
    u.rol = "empleado"
    return u


@pytest.fixture
def centro_mock():
    c = MagicMock()
    c.id = 10
    c.nombre = "Centro Norte"
    c.direccion = "Calle Falsa 123"
    c.telefono = "600000000"
    c.email = "norte@test.com"
    return c


# ── GET /centros ─────────────────────────────────────────────────────────────

class TestGetCentros:
    def test_superadmin_ve_todos_los_centros(self, client, super_admin, centro_mock):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro:
            MockUsuario.query.get.return_value = super_admin
            MockCentro.query.all.return_value = [centro_mock]

            res = client.get(f"/centros?user_id={super_admin.id}")

        assert res.status_code == 200
        data = res.get_json()
        assert len(data) == 1
        assert data[0]["nombre"] == "Centro Norte"

    def test_usuario_normal_ve_solo_sus_centros(self, client, usuario_normal, centro_mock):
        asignacion = MagicMock()
        asignacion.centro_id = centro_mock.id

        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro, \
             patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockUsuario.query.get.return_value = usuario_normal
            MockCU.query.filter_by.return_value.all.return_value = [asignacion]
            MockCentro.query.filter.return_value.all.return_value = [centro_mock]

            res = client.get(f"/centros?user_id={usuario_normal.id}")

        assert res.status_code == 200
        assert len(res.get_json()) == 1

    def test_usuario_no_encontrado(self, client):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = None
            res = client.get("/centros?user_id=999")

        assert res.status_code == 404


# ── POST /centros/añadir ──────────────────────────────────────────────────────

class TestAddCentro:
    def test_crear_centro_exitoso(self, client, super_admin, centro_mock):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro, \
             patch("Centros.centrosController.db") as mock_db:
            MockUsuario.query.get.return_value = super_admin
            # Simulamos que el centro creado tiene los atributos correctos
            instancia = MagicMock()
            instancia.id = 10
            instancia.nombre = "Centro Norte"
            instancia.direccion = "Calle Falsa 123"
            instancia.telefono = "600000000"
            instancia.email = "norte@test.com"
            MockCentro.return_value = instancia

            res = client.post("/centros/añadir", json={
                "user": super_admin.id,
                "nombre": "Centro Norte",
                "direccion": "Calle Falsa 123",
                "telefono": "600000000",
                "email": "norte@test.com"
            })

        assert res.status_code == 201
        assert res.get_json()["centro"]["nombre"] == "Centro Norte"
        mock_db.session.add.assert_called_once()
        mock_db.session.commit.assert_called_once()

    def test_crear_centro_sin_permisos(self, client, usuario_normal):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = usuario_normal
            res = client.post("/centros/añadir", json={
                "user": usuario_normal.id,
                "nombre": "Centro",
                "direccion": "Dir",
                "telefono": "600",
                "email": "a@a.com"
            })

        assert res.status_code == 403

    def test_crear_centro_campos_faltantes(self, client, super_admin):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = super_admin
            res = client.post("/centros/añadir", json={
                "user": super_admin.id,
                "nombre": "Solo nombre"
                # faltan direccion, telefono, email
            })

        assert res.status_code == 400
        assert "Faltan campos" in res.get_json()["message"]

    def test_crear_centro_sin_datos(self, client):
        res = client.post("/centros/añadir", content_type="application/json", data="")
        assert res.status_code == 400

    def test_crear_centro_error_bd(self, client, super_admin):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro"), \
             patch("Centros.centrosController.db") as mock_db:
            MockUsuario.query.get.return_value = super_admin
            mock_db.session.commit.side_effect = Exception("DB error")

            res = client.post("/centros/añadir", json={
                "user": super_admin.id,
                "nombre": "Centro",
                "direccion": "Dir",
                "telefono": "600",
                "email": "a@a.com"
            })

        assert res.status_code == 500
        mock_db.session.rollback.assert_called_once()


# ── GET /usuarios ────────────────────────────────────────────────────────────

class TestGetUsuarios:
    def test_devuelve_lista_sin_superadmins(self, client, usuario_normal):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.filter.return_value.all.return_value = [usuario_normal]
            res = client.get("/usuarios")

        assert res.status_code == 200
        data = res.get_json()
        assert any(u["username"] == "juan" for u in data)

    def test_devuelve_lista_vacia(self, client):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.filter.return_value.all.return_value = []
            res = client.get("/usuarios")

        assert res.status_code == 200
        assert res.get_json() == []


# ── GET /centros/<id>/usuarios ───────────────────────────────────────────────

class TestGetUsuariosCentro:
    def test_devuelve_usuarios_del_centro(self, client, usuario_normal):
        asignacion = MagicMock()
        asignacion.id = 1
        asignacion.usuario_id = usuario_normal.id
        asignacion.usuario.username = "juan"
        asignacion.rol = "empleado"
        asignacion.activo = True

        with patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockCU.query.filter_by.return_value.all.return_value = [asignacion]
            res = client.get("/centros/10/usuarios")

        assert res.status_code == 200
        assert res.get_json()[0]["username"] == "juan"

    def test_centro_sin_usuarios(self, client):
        with patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockCU.query.filter_by.return_value.all.return_value = []
            res = client.get("/centros/10/usuarios")

        assert res.status_code == 200
        assert res.get_json() == []


# ── POST /centros/<id>/asignar-usuario ───────────────────────────────────────

class TestAsignarUsuario:
    def test_asignar_nuevo_usuario(self, client, super_admin, usuario_normal, centro_mock):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro, \
             patch("Centros.centrosController.CentroUsuario") as MockCU, \
             patch("Centros.centrosController.db") as mock_db:
            MockUsuario.query.get.side_effect = lambda uid: \
                super_admin if uid == super_admin.id else usuario_normal
            MockCentro.query.get.return_value = centro_mock
            MockCU.query.filter_by.return_value.first.return_value = None  # no existe aún

            res = client.post("/centros/10/asignar-usuario", json={
                "user_id": super_admin.id,
                "usuario_id": usuario_normal.id,
                "rol": "empleado"
            })

        assert res.status_code == 200
        mock_db.session.commit.assert_called_once()

    def test_actualizar_rol_usuario_existente(self, client, super_admin, usuario_normal, centro_mock):
        asignacion_existente = MagicMock()

        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro, \
             patch("Centros.centrosController.CentroUsuario") as MockCU, \
             patch("Centros.centrosController.db") as mock_db:
            MockUsuario.query.get.side_effect = lambda uid: \
                super_admin if uid == super_admin.id else usuario_normal
            MockCentro.query.get.return_value = centro_mock
            MockCU.query.filter_by.return_value.first.return_value = asignacion_existente

            res = client.post("/centros/10/asignar-usuario", json={
                "user_id": super_admin.id,
                "usuario_id": usuario_normal.id,
                "rol": "admin"
            })

        assert res.status_code == 200
        assert asignacion_existente.rol == "admin"

    def test_no_se_puede_asignar_rol_superadmin(self, client, super_admin):
        with patch("Centros.centrosController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = super_admin
            res = client.post("/centros/10/asignar-usuario", json={
                "user_id": super_admin.id,
                "usuario_id": 2,
                "rol": "superAdmin"
            })

        assert res.status_code == 403

    def test_sin_permisos(self, client, usuario_normal):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockUsuario.query.get.return_value = usuario_normal
            MockCU.query.filter_by.return_value.first.return_value = None

            res = client.post("/centros/10/asignar-usuario", json={
                "user_id": usuario_normal.id,
                "usuario_id": 3,
                "rol": "empleado"
            })

        assert res.status_code == 403

    def test_centro_o_usuario_no_encontrado(self, client, super_admin):
        with patch("Centros.centrosController.Usuario") as MockUsuario, \
             patch("Centros.centrosController.Centro") as MockCentro, \
             patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockUsuario.query.get.return_value = super_admin
            MockCentro.query.get.return_value = None
            MockCU.query.filter_by.return_value.first.return_value = None

            res = client.post("/centros/10/asignar-usuario", json={
                "user_id": super_admin.id,
                "usuario_id": 999,
                "rol": "empleado"
            })

        assert res.status_code == 404


# ── DELETE /centros/<id>/asignar-usuario/<usuario_id> ────────────────────────

class TestEliminarUsuarioCentro:
    def test_eliminar_exitoso(self, client, usuario_normal):
        asignacion = MagicMock()

        with patch("Centros.centrosController.CentroUsuario") as MockCU, \
             patch("Centros.centrosController.db") as mock_db:
            MockCU.query.filter_by.return_value.first.return_value = asignacion
            res = client.delete(f"/centros/10/asignar-usuario/{usuario_normal.id}")

        assert res.status_code == 200
        mock_db.session.delete.assert_called_once_with(asignacion)
        mock_db.session.commit.assert_called_once()

    def test_eliminar_asignacion_no_encontrada(self, client):
        with patch("Centros.centrosController.CentroUsuario") as MockCU:
            MockCU.query.filter_by.return_value.first.return_value = None
            res = client.delete("/centros/10/asignar-usuario/999")

        assert res.status_code == 404