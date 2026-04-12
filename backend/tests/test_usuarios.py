# tests/test_usuarios.py
import pytest
import sys
from unittest.mock import MagicMock, patch
from werkzeug.security import generate_password_hash


# ── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def mock_clases_module():
    from unittest.mock import MagicMock
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

    from Usuarios.loginController import usuarios_bp
    app.register_blueprint(usuarios_bp)

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def usuario_mock():
    u = MagicMock()
    u.id = 1
    u.username = "ana"
    u.contrasena = generate_password_hash("secreta123")
    u.rol = "admin"
    u.set_password = False
    return u


@pytest.fixture
def token(app, usuario_mock):
    from flask_jwt_extended import create_access_token
    with app.app_context():
        return create_access_token(identity=str(usuario_mock.id))


# ── POST /login ──────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_exitoso(self, client, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.filter_by.return_value.first.return_value = usuario_mock
            res = client.post("/login", json={"username": "ana", "password": "secreta123"})

        assert res.status_code == 200
        data = res.get_json()
        assert "token" in data
        assert data["user"]["username"] == "ana"

    def test_login_credenciales_invalidas(self, client, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.filter_by.return_value.first.return_value = usuario_mock
            res = client.post("/login", json={"username": "ana", "password": "wrongpass"})

        assert res.status_code == 401

    def test_login_usuario_no_existe(self, client):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.filter_by.return_value.first.return_value = None
            res = client.post("/login", json={"username": "nadie", "password": "clave"})

        assert res.status_code == 401

    def test_login_sin_datos(self, client):
        res = client.post("/login", content_type="application/json", data="")
        assert res.status_code == 400

    def test_login_sin_password(self, client):
        res = client.post("/login", json={"username": "ana"})
        assert res.status_code == 400


# ── POST /register ───────────────────────────────────────────────────────────

class TestRegister:
    def test_register_exitoso(self, client):
        with patch("Usuarios.loginController.Usuario") as MockUsuario, \
             patch("Usuarios.loginController.db") as mock_db:
            MockUsuario.query.filter_by.return_value.first.return_value = None
            res = client.post("/register", json={"username": "nuevo"})

        assert res.status_code == 201
        mock_db.session.add.assert_called_once()
        mock_db.session.commit.assert_called_once()

    def test_register_usuario_ya_existe(self, client, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.filter_by.return_value.first.return_value = usuario_mock
            res = client.post("/register", json={"username": "ana"})

        assert res.status_code == 409

    def test_register_sin_username(self, client):
        res = client.post("/register", json={"otro": "x"})
        assert res.status_code == 400

    def test_register_sin_datos(self, client):
        res = client.post("/register", content_type="application/json", data="")
        assert res.status_code == 400


# ── GET /me ──────────────────────────────────────────────────────────────────

class TestGetMe:
    def test_get_me_exitoso(self, client, token, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = usuario_mock
            res = client.get("/me", headers={"Authorization": f"Bearer {token}"})

        assert res.status_code == 200
        assert res.get_json()["username"] == "ana"

    def test_get_me_sin_token(self, client):
        res = client.get("/me")
        assert res.status_code == 401

    def test_get_me_usuario_no_encontrado(self, client, token):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = None
            res = client.get("/me", headers={"Authorization": f"Bearer {token}"})

        assert res.status_code == 404


# ── POST /set-password ───────────────────────────────────────────────────────

class TestSetPassword:
    def test_set_password_exitoso(self, client, token, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario, \
             patch("Usuarios.loginController.db") as mock_db:
            MockUsuario.query.get.return_value = usuario_mock
            res = client.post(
                "/set-password",
                json={"password": "nuevaclave123"},
                headers={"Authorization": f"Bearer {token}"}
            )

        assert res.status_code == 200
        assert usuario_mock.set_password == False
        mock_db.session.commit.assert_called_once()

    def test_set_password_muy_corta(self, client, token, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = usuario_mock
            res = client.post(
                "/set-password",
                json={"password": "abc"},
                headers={"Authorization": f"Bearer {token}"}
            )

        assert res.status_code == 400

    def test_set_password_sin_campo(self, client, token, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = usuario_mock
            res = client.post(
                "/set-password",
                json={},
                headers={"Authorization": f"Bearer {token}"}
            )

        assert res.status_code == 400

    def test_set_password_sin_token(self, client):
        res = client.post("/set-password", json={"password": "nuevaclave123"})
        assert res.status_code == 401


# ── POST /usuarios/<id>/reset-password ──────────────────────────────────────

class TestResetPassword:
    @pytest.fixture
    def super_admin(self):
        u = MagicMock()
        u.id = 99
        u.username = "admin"
        u.rol = "superAdmin"
        return u

    @pytest.fixture
    def token_admin(self, app, super_admin):
        from flask_jwt_extended import create_access_token
        with app.app_context():
            return create_access_token(identity=str(super_admin.id))

    def test_reset_exitoso(self, client, token_admin, super_admin, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario, \
             patch("Usuarios.loginController.db") as mock_db:
            MockUsuario.query.get.side_effect = lambda uid: \
                super_admin if str(uid) == str(super_admin.id) else usuario_mock
            res = client.post(
                f"/usuarios/{usuario_mock.id}/reset-password",
                headers={"Authorization": f"Bearer {token_admin}"}
            )

        assert res.status_code == 200
        assert usuario_mock.set_password == True
        mock_db.session.commit.assert_called_once()

    def test_reset_sin_permiso(self, client, token, usuario_mock):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.return_value = usuario_mock
            res = client.post(
                "/usuarios/2/reset-password",
                headers={"Authorization": f"Bearer {token}"}
            )

        assert res.status_code == 403

    def test_reset_usuario_no_encontrado(self, client, token_admin, super_admin):
        with patch("Usuarios.loginController.Usuario") as MockUsuario:
            MockUsuario.query.get.side_effect = lambda uid: \
                super_admin if str(uid) == str(super_admin.id) else None
            res = client.post(
                "/usuarios/999/reset-password",
                headers={"Authorization": f"Bearer {token_admin}"}
            )

        assert res.status_code == 404

    def test_reset_sin_token(self, client):
        res = client.post("/usuarios/1/reset-password")
        assert res.status_code == 401
