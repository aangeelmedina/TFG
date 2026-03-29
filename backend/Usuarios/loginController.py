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
                "role": user.rol # o user.role si lo cambiaste
            },
            "token": access_token 
        }), 200

    return jsonify({"message": "Credenciales inválidas"}), 401


@usuarios_bp.route('/register', methods=['POST']) # 🔥 Solo POST y recibe JSON
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No se enviaron datos"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Faltan campos obligatorios"}), 400

    # Verificar si el usuario ya existe
    if Usuario.query.filter_by(username=username).first():
        return jsonify({"message": "El nombre de usuario ya está en uso"}), 409

    # Crear usuario
    hashed_password = generate_password_hash(password)
    new_user = Usuario(username=username, contrasena=hashed_password, rol="user") # Asignar un rol por defecto
    
    db.session.add(new_user)
    db.session.commit() 
    
    # 🔥 Devolvemos JSON, ya no redirigimos a una plantilla
    return jsonify({"message": "Usuario registrado exitosamente"}), 201


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
        "role": user.rol
    }), 200


# El Logout ya no es estrictamente necesario en el backend a menos que uses Blocklists (lista negra de tokens).
# En una arquitectura JWT básica, el logout se hace en React borrando el localStorage.

