# tests/test_nodos.py
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

    from Nodos.nodosController import nodos_bp
    app.register_blueprint(nodos_bp)

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def paciente_mock():
    p = MagicMock()
    p.id = 1
    p.nombre = "Paciente Test"
    p.arboles = []
    return p


@pytest.fixture
def arbol_mock():
    a = MagicMock()
    a.id = 10
    a.titulo = "Árbol Test"
    a.paciente_id = 1
    a.to_dict.return_value = {"id": 10, "titulo": "Árbol Test"}
    return a


@pytest.fixture
def nodo_mock():
    n = MagicMock()
    n.id = 100
    n.texto = "Inicio"
    n.es_final = False
    n.padre_id = None
    n.arbol_id = 10
    n.puede_tener_hijos.return_value = True
    n.to_dict.return_value = {"id": 100, "texto": "Inicio", "es_final": False}
    return n


@pytest.fixture
def nodo_hijo_mock():
    n = MagicMock()
    n.id = 101
    n.texto = "Opción A"
    n.es_final = False
    n.padre_id = 100
    n.arbol_id = 10
    n.to_dict.return_value = {"id": 101, "texto": "Opción A", "es_final": False}
    return n


# ── GET /api/pacientes/<id>/arboles ─────────────────────────────────────────

class TestGetArboles:
    def test_devuelve_arboles_del_paciente(self, client, paciente_mock, arbol_mock):
        paciente_mock.arboles = [arbol_mock]
        with patch("Nodos.nodosController.Paciente") as MockPaciente:
            MockPaciente.query.get.return_value = paciente_mock
            res = client.get("/api/pacientes/1/arboles")

        assert res.status_code == 200
        assert len(res.get_json()) == 1

    def test_paciente_no_encontrado(self, client):
        with patch("Nodos.nodosController.Paciente") as MockPaciente:
            MockPaciente.query.get.return_value = None
            res = client.get("/api/pacientes/999/arboles")

        assert res.status_code == 404


# ── POST /api/pacientes/<id>/arboles ────────────────────────────────────────

class TestCrearArbol:
    def test_crear_arbol_con_titulo(self, client, paciente_mock, arbol_mock, nodo_mock):
        arbol_mock.to_dict.return_value = {"id": 10, "titulo": "Mi árbol"}

        with patch("Nodos.nodosController.Paciente") as MockPaciente, \
             patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db") as mock_db:
            MockPaciente.query.get.return_value = paciente_mock
            MockArbol.return_value = arbol_mock
            MockNodo.return_value = nodo_mock

            res = client.post("/api/pacientes/1/arboles", json={"titulo": "Mi árbol"})

        assert res.status_code == 201
        mock_db.session.flush.assert_called_once()
        mock_db.session.commit.assert_called_once()

    def test_crear_arbol_sin_titulo_usa_default(self, client, paciente_mock, arbol_mock, nodo_mock):
        with patch("Nodos.nodosController.Paciente") as MockPaciente, \
             patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db"):
            MockPaciente.query.get.return_value = paciente_mock
            # Capturamos los kwargs con los que se llama ArbolDecision(...)
            MockArbol.return_value = arbol_mock
            MockNodo.return_value = nodo_mock

            res = client.post("/api/pacientes/1/arboles", json={})

        assert res.status_code == 201
        # Verificamos que se usó el título por defecto
        call_kwargs = MockArbol.call_args
        assert call_kwargs.kwargs.get("titulo") == "Árbol sin título" or \
               call_kwargs.args[0] == "Árbol sin título"

    def test_paciente_no_encontrado(self, client):
        with patch("Nodos.nodosController.Paciente") as MockPaciente:
            MockPaciente.query.get.return_value = None
            res = client.post("/api/pacientes/999/arboles", json={"titulo": "X"})

        assert res.status_code == 404


# ── GET /api/pacientes/<id>/arboles/<id> ────────────────────────────────────

class TestGetArbol:
    def test_get_arbol_exitoso(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = arbol_mock
            res = client.get("/api/pacientes/1/arboles/10")

        assert res.status_code == 200

    def test_arbol_no_encontrado(self, client):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = None
            res = client.get("/api/pacientes/1/arboles/999")

        assert res.status_code == 404

    def test_arbol_no_pertenece_al_paciente(self, client, arbol_mock):
        arbol_mock.paciente_id = 99  # paciente distinto
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = arbol_mock
            res = client.get("/api/pacientes/1/arboles/10")

        assert res.status_code == 403


# ── PATCH /api/pacientes/<id>/arboles/<id> ───────────────────────────────────

class TestEditarArbol:
    def test_editar_titulo_exitoso(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.db") as mock_db:
            MockArbol.query.get.return_value = arbol_mock
            res = client.patch("/api/pacientes/1/arboles/10", json={"titulo": "Nuevo título"})

        assert res.status_code == 200
        assert arbol_mock.titulo == "Nuevo título"
        mock_db.session.commit.assert_called_once()

    def test_editar_titulo_vacio(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = arbol_mock
            res = client.patch("/api/pacientes/1/arboles/10", json={"titulo": "   "})

        assert res.status_code == 400
        assert "vacío" in res.get_json()["error"]


# ── DELETE /api/pacientes/<id>/arboles/<id> ──────────────────────────────────

class TestEliminarArbol:
    def test_eliminar_exitoso(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.db") as mock_db:
            MockArbol.query.get.return_value = arbol_mock
            res = client.delete("/api/pacientes/1/arboles/10")

        assert res.status_code == 200
        assert res.get_json()["eliminado"] == 10
        mock_db.session.delete.assert_called_once_with(arbol_mock)
        mock_db.session.commit.assert_called_once()

    def test_arbol_no_encontrado(self, client):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = None
            res = client.delete("/api/pacientes/1/arboles/999")

        assert res.status_code == 404


# ── POST /api/pacientes/<id>/arboles/<id>/nodos ──────────────────────────────

class TestCrearNodo:
    def test_crear_nodo_exitoso(self, client, arbol_mock, nodo_mock, nodo_hijo_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db") as mock_db:
            MockArbol.query.get.return_value = arbol_mock
            # Primer get = nodo padre, return_value del constructor = nodo hijo
            MockNodo.query.get.return_value = nodo_mock
            MockNodo.return_value = nodo_hijo_mock

            res = client.post("/api/pacientes/1/arboles/10/nodos", json={
                "padre_id": 100,
                "texto": "Opción A",
                "es_final": False
            })

        assert res.status_code == 201
        mock_db.session.commit.assert_called_once()

    def test_crear_nodo_sin_texto(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = arbol_mock
            res = client.post("/api/pacientes/1/arboles/10/nodos", json={
                "padre_id": 100,
                "texto": ""
            })

        assert res.status_code == 400
        assert "texto" in res.get_json()["error"]

    def test_crear_nodo_sin_padre_id(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol:
            MockArbol.query.get.return_value = arbol_mock
            res = client.post("/api/pacientes/1/arboles/10/nodos", json={
                "texto": "Nodo huérfano"
            })

        assert res.status_code == 400
        assert "padre_id" in res.get_json()["error"]

    def test_padre_con_max_hijos(self, client, arbol_mock, nodo_mock):
        nodo_mock.puede_tener_hijos.return_value = False

        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.post("/api/pacientes/1/arboles/10/nodos", json={
                "padre_id": 100,
                "texto": "Nodo extra"
            })

        assert res.status_code == 400
        assert "máximo" in res.get_json()["error"]

    def test_padre_no_pertenece_al_arbol(self, client, arbol_mock, nodo_mock):
        nodo_mock.arbol_id = 99  # árbol distinto

        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.post("/api/pacientes/1/arboles/10/nodos", json={
                "padre_id": 100,
                "texto": "Nodo"
            })

        assert res.status_code == 404


# ── PATCH /api/pacientes/<id>/arboles/<id>/nodos/<id> ────────────────────────

class TestEditarNodo:
    def test_editar_texto_exitoso(self, client, arbol_mock, nodo_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db") as mock_db:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.patch("/api/pacientes/1/arboles/10/nodos/100", json={
                "texto": "Texto actualizado"
            })

        assert res.status_code == 200
        assert nodo_mock.texto == "Texto actualizado"
        mock_db.session.commit.assert_called_once()

    def test_editar_es_final(self, client, arbol_mock, nodo_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db"):
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.patch("/api/pacientes/1/arboles/10/nodos/100", json={
                "es_final": True
            })

        assert res.status_code == 200
        assert nodo_mock.es_final == True

    def test_editar_texto_vacio(self, client, arbol_mock, nodo_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.patch("/api/pacientes/1/arboles/10/nodos/100", json={
                "texto": "   "
            })

        assert res.status_code == 400


# ── DELETE /api/pacientes/<id>/arboles/<id>/nodos/<id> ───────────────────────

class TestEliminarNodo:
    def test_eliminar_nodo_hijo(self, client, arbol_mock, nodo_hijo_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo, \
             patch("Nodos.nodosController.db") as mock_db:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_hijo_mock

            res = client.delete("/api/pacientes/1/arboles/10/nodos/101")

        assert res.status_code == 200
        assert res.get_json()["eliminado"] == 101
        mock_db.session.delete.assert_called_once_with(nodo_hijo_mock)

    def test_no_se_puede_eliminar_raiz(self, client, arbol_mock, nodo_mock):
        nodo_mock.padre_id = None  # es raíz

        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = nodo_mock

            res = client.delete("/api/pacientes/1/arboles/10/nodos/100")

        assert res.status_code == 400
        assert "raíz" in res.get_json()["error"]

    def test_nodo_no_encontrado(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.get.return_value = None

            res = client.delete("/api/pacientes/1/arboles/10/nodos/999")

        assert res.status_code == 404


# ── GET /api/pacientes/<id>/arboles/<id>/jugar ───────────────────────────────

class TestJugarArbol:
    def test_jugar_desde_raiz(self, client, arbol_mock, nodo_mock, nodo_hijo_mock):
        nodo_mock.padre_id = None

        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            # filter_by devuelve la raíz, filter_by(padre_id=nodo.id) devuelve hijos
            MockNodo.query.filter_by.return_value.first.return_value = nodo_mock
            MockNodo.query.filter_by.return_value.all.return_value = [nodo_hijo_mock]

            res = client.get("/api/pacientes/1/arboles/10/jugar")

        assert res.status_code == 200
        data = res.get_json()
        assert data["id"] == nodo_mock.id
        assert "hijos" in data
        assert "nivel" in data

    def test_jugar_desde_nodo_especifico(self, client, arbol_mock, nodo_hijo_mock):
        nodo_hijo_mock.padre_id = 100

        padre = MagicMock()
        padre.padre_id = None  # la raíz no tiene padre

        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            # get devuelve el nodo hijo cuando se pide su id, y el padre cuando se sube
            MockNodo.query.get.side_effect = lambda nid: \
                nodo_hijo_mock if nid == nodo_hijo_mock.id else padre
            MockNodo.query.filter_by.return_value.all.return_value = []

            res = client.get(f"/api/pacientes/1/arboles/10/jugar?nodo_id={nodo_hijo_mock.id}")

        assert res.status_code == 200
        assert res.get_json()["nivel"] == 1  # un nivel de profundidad

    def test_arbol_sin_raiz(self, client, arbol_mock):
        with patch("Nodos.nodosController.ArbolDecision") as MockArbol, \
             patch("Nodos.nodosController.Nodo") as MockNodo:
            MockArbol.query.get.return_value = arbol_mock
            MockNodo.query.filter_by.return_value.first.return_value = None

            res = client.get("/api/pacientes/1/arboles/10/jugar")

        assert res.status_code == 404
        assert "raíz" in res.get_json()["error"]