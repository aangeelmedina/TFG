from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from clases import db, Usuario

# 🔥 Importamos todo lo necesario de flask_jwt_extended
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

usuarios_bp = Blueprint('usuarios', __name__)

# Nota: Asumo que en tu app principal haces: app.register_blueprint(usuarios_bp, url_prefix='/auth')
# Así que las rutas serán /auth/login, /auth/register, etc. Si no, pon '/auth/login' aquí abajo.

@usuarios_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "No se enviaron datos"}), 400

    username = data.get('username') or data.get('email')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Faltan credenciales"}), 400

    user = Usuario.query.filter_by(username=username).first()

    if user and check_password_hash(user.contrasena, password):
        # 1. 🔥 Creamos un token real con flask_jwt_extended guardando el ID
        # Convertimos user.id a string por si acaso, es una buena práctica para identidades JWT
        access_token = create_access_token(identity=str(user.id))

        # 2. Devolvemos la estructura exacta para React
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.rol,
                "setPassword": user.set_password
            },
            "token": access_token 
        }), 200

    return jsonify({"message": "Credenciales inválidas"}), 401


@usuarios_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No se enviaron datos"}), 400

    username = data.get('username')
    if not username:
        return jsonify({"message": "El username es obligatorio"}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"message": "El usuario ya existe"}), 409

    hashed = generate_password_hash(username)  # contraseña temporal = username encriptado

    new_user = Usuario(
        username=username,
        contrasena=hashed,
        rol=data.get('rol', 'tutor'),
        set_password=True
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado correctamente"}), 201


@usuarios_bp.route('/me', methods=['GET'])
@jwt_required() 
def get_me():
    # Obtener el ID que guardamos al crear el token
    current_user_id = get_jwt_identity()

    user = Usuario.query.get(current_user_id)

    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.rol,
        "setPassword": user.set_password
    }), 200


@usuarios_bp.route('/set-password', methods=['POST'])
@jwt_required()
def set_password():
    """Cambiar contraseña temporal al acceder por primera vez"""
    current_user_id = get_jwt_identity()
    
    user = Usuario.query.get(current_user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({"message": "La contraseña es requerida"}), 400
    
    new_password = data.get('password')
    if not new_password or len(new_password) < 6:
        return jsonify({"message": "La contraseña debe tener al menos 6 caracteres"}), 400
    
    # Actualizar contraseña y marcar como que ya cambió su contraseña
    user.contrasena = generate_password_hash(new_password)
    user.set_password = False
    db.session.commit()
    
    return jsonify({"message": "Contraseña actualizada correctamente"}), 200


# El Logout ya no es estrictamente necesario en el backend a menos que uses Blocklists (lista negra de tokens).
# En una arquitectura JWT básica, el logout se hace en React borrando el localStorage.

