# tests/test_pacientes.py
import pytest
import sys
from unittest.mock import MagicMock, patch


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def mock_clases_module():
    mock_clases = MagicMock()
    sys.modules["clases"] = mock_clases
    yield mock_clases


@pytest.fixture
def app(mock_clases_module):
    from flask import Flask

    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret"

    from Pacientes.pacientesController import pacientes_bp
    app.register_blueprint(pacientes_bp)

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def paciente_mock():
    p = MagicMock()
    p.id = 1
    p.nombre = "Luis"
    p.apellidos = "García"
    p.dni = "12345678A"
    p.edad = 45
    p.contacto = "600000000"
    p.historial_medico = "Ninguno"
    p.estado = "En tratamiento"
    p.fecha_ingreso = None
    p.centro_id = 10
    p.to_dict.return_value = {
        "id": 1, "nombre": "Luis", "apellidos": "García",
        "dni": "12345678A", "edad": 45, "estado": "En tratamiento"
    }
    return p


@pytest.fixture
def datos_paciente_validos():
    return {
        "user_id": 1,
        "nombre": "Luis",
        "apellidos": "García",
        "dni": "12345678A",
        "edad": 45,
        "estado": "En tratamiento"
    }


# ── GET /centros/<id>/pacientes ───────────────────────────────────────────────

class TestGetPacientes:
    def test_devuelve_pacientes_del_centro(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.filter_by.return_value.all.return_value = [paciente_mock]

            res = client.get("/centros/10/pacientes?user_id=1")

        assert res.status_code == 200
        assert len(res.get_json()) == 1
        assert res.get_json()[0]["nombre"] == "Luis"

    def test_sin_acceso_devuelve_403(self, client):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=False):
            res = client.get("/centros/10/pacientes?user_id=1")

        assert res.status_code == 403

    def test_sin_user_id_devuelve_403(self, client):
        res = client.get("/centros/10/pacientes")
        assert res.status_code == 403

    def test_centro_sin_pacientes(self, client):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.filter_by.return_value.all.return_value = []

            res = client.get("/centros/10/pacientes?user_id=1")

        assert res.status_code == 200
        assert res.get_json() == []


# ── POST /centros/<id>/pacientes ──────────────────────────────────────────────

class TestCrearPaciente:
    def test_crear_paciente_exitoso(self, client, paciente_mock, datos_paciente_validos):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db") as mock_db:
            MockPaciente.return_value = paciente_mock

            res = client.post("/centros/10/pacientes", json=datos_paciente_validos)

        assert res.status_code == 201
        assert res.get_json()["message"] == "Paciente creado"
        mock_db.session.add.assert_called_once()
        mock_db.session.commit.assert_called_once()

    def test_crear_paciente_sin_acceso(self, client, datos_paciente_validos):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=False):
            res = client.post("/centros/10/pacientes", json=datos_paciente_validos)

        assert res.status_code == 403

    def test_crear_paciente_campos_faltantes(self, client):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True):
            res = client.post("/centros/10/pacientes", json={
                "user_id": 1,
                "nombre": "Solo nombre"
                # faltan apellidos, dni, edad
            })

        assert res.status_code == 400
        assert "Faltan campos" in res.get_json()["message"]

    def test_crear_paciente_estado_invalido(self, client):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True):
            res = client.post("/centros/10/pacientes", json={
                "user_id": 1,
                "nombre": "Luis", "apellidos": "García",
                "dni": "12345678A", "edad": 45,
                "estado": "Inventado"
            })

        assert res.status_code == 400
        assert "Estado no válido" in res.get_json()["message"]

    def test_crear_paciente_fecha_invalida(self, client):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True):
            res = client.post("/centros/10/pacientes", json={
                "user_id": 1,
                "nombre": "Luis", "apellidos": "García",
                "dni": "12345678A", "edad": 45,
                "fecha_ingreso": "no-es-una-fecha"
            })

        assert res.status_code == 400
        assert "fecha" in res.get_json()["message"].lower()

    def test_crear_paciente_fecha_valida(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db"):
            MockPaciente.return_value = paciente_mock

            res = client.post("/centros/10/pacientes", json={
                "user_id": 1,
                "nombre": "Luis", "apellidos": "García",
                "dni": "12345678A", "edad": 45,
                "fecha_ingreso": "2024-01-15"
            })

        assert res.status_code == 201

    def test_crear_paciente_error_bd(self, client, datos_paciente_validos):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente"), \
             patch("Pacientes.pacientesController.db") as mock_db:
            mock_db.session.commit.side_effect = Exception("DB error")

            res = client.post("/centros/10/pacientes", json=datos_paciente_validos)

        assert res.status_code == 500
        mock_db.session.rollback.assert_called_once()


# ── PUT /pacientes/<id> ───────────────────────────────────────────────────────

class TestEditarPaciente:
    def test_editar_paciente_exitoso(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db") as mock_db:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.put("/pacientes/1", json={
                "user_id": 1,
                "nombre": "Luis Editado",
                "estado": "Alta médica"
            })

        assert res.status_code == 200
        assert paciente_mock.nombre == "Luis Editado"
        assert paciente_mock.estado == "Alta médica"
        mock_db.session.commit.assert_called_once()

    def test_editar_paciente_sin_acceso(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=False), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.put("/pacientes/1", json={"user_id": 1, "nombre": "X"})

        assert res.status_code == 403

    def test_editar_estado_invalido(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.put("/pacientes/1", json={
                "user_id": 1,
                "estado": "Estado inventado"
            })

        assert res.status_code == 400

    def test_editar_fecha_invalida(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.put("/pacientes/1", json={
                "user_id": 1,
                "fecha_ingreso": "fecha-mala"
            })

        assert res.status_code == 500  # cae en el except generico

    def test_editar_paciente_no_encontrado(self, client, app):
        with patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            # get_or_404 lanza 404 automáticamente si no encuentra
            from werkzeug.exceptions import NotFound
            MockPaciente.query.get_or_404.side_effect = NotFound()

            res = client.put("/pacientes/999", json={"user_id": 1, "nombre": "X"})

        assert res.status_code == 404

    def test_editar_error_bd(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db") as mock_db:
            MockPaciente.query.get_or_404.return_value = paciente_mock
            mock_db.session.commit.side_effect = Exception("DB error")

            res = client.put("/pacientes/1", json={"user_id": 1})

        assert res.status_code == 500
        mock_db.session.rollback.assert_called_once()


# ── DELETE /pacientes/<id> ────────────────────────────────────────────────────

class TestEliminarPaciente:
    def test_eliminar_exitoso(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db") as mock_db:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.delete("/pacientes/1?user_id=1")

        assert res.status_code == 200
        assert res.get_json()["message"] == "Paciente eliminado"
        mock_db.session.delete.assert_called_once_with(paciente_mock)
        mock_db.session.commit.assert_called_once()

    def test_eliminar_sin_acceso(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=False), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            MockPaciente.query.get_or_404.return_value = paciente_mock

            res = client.delete("/pacientes/1?user_id=1")

        assert res.status_code == 403

    def test_eliminar_paciente_no_encontrado(self, client):
        with patch("Pacientes.pacientesController.Paciente") as MockPaciente:
            from werkzeug.exceptions import NotFound
            MockPaciente.query.get_or_404.side_effect = NotFound()

            res = client.delete("/pacientes/999?user_id=1")

        assert res.status_code == 404

    def test_eliminar_error_bd(self, client, paciente_mock):
        with patch("Pacientes.pacientesController._tiene_acceso_centro", return_value=True), \
             patch("Pacientes.pacientesController.Paciente") as MockPaciente, \
             patch("Pacientes.pacientesController.db") as mock_db:
            MockPaciente.query.get_or_404.return_value = paciente_mock
            mock_db.session.commit.side_effect = Exception("DB error")

            res = client.delete("/pacientes/1?user_id=1")

        assert res.status_code == 500
        mock_db.session.rollback.assert_called_once()


# ── Tests del helper _tiene_acceso_centro ────────────────────────────────────

class TestTieneAccesoCentro:
    """Testea el helper directamente, sin HTTP."""

    def test_superadmin_tiene_acceso(self):
        user = MagicMock()
        user.rol = "superAdmin"

        with patch("Pacientes.pacientesController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = user
            from Pacientes.pacientesController import _tiene_acceso_centro
            assert _tiene_acceso_centro(1, 10) is True

    def test_usuario_con_asignacion_tiene_acceso(self):
        user = MagicMock()
        user.rol = "admin"

        with patch("Pacientes.pacientesController.Usuario") as MockUsuario, \
             patch("Pacientes.pacientesController.CentroUsuario") as MockCU:
            MockUsuario.query.get.return_value = user
            MockCU.query.filter_by.return_value.first.return_value = MagicMock()

            from Pacientes.pacientesController import _tiene_acceso_centro
            assert _tiene_acceso_centro(1, 10) is True

    def test_usuario_sin_asignacion_no_tiene_acceso(self):
        user = MagicMock()
        user.rol = "empleado"

        with patch("Pacientes.pacientesController.Usuario") as MockUsuario, \
             patch("Pacientes.pacientesController.CentroUsuario") as MockCU:
            MockUsuario.query.get.return_value = user
            MockCU.query.filter_by.return_value.first.return_value = None

            from Pacientes.pacientesController import _tiene_acceso_centro
            assert _tiene_acceso_centro(1, 10) is False

    def test_usuario_no_existe_no_tiene_acceso(self):
        with patch("Pacientes.pacientesController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = None

            from Pacientes.pacientesController import _tiene_acceso_centro
            assert _tiene_acceso_centro(999, 10) is False