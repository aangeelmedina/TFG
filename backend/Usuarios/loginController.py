from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from clases import db, Usuario
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

usuarios_bp = Blueprint('usuarios', __name__)


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
        # 1. Creamos un token real con flask_jwt_extended guardando el ID
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
        rol=None ,  # El rol se asignará después
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

@usuarios_bp.route('/usuarios/<int:usuario_id>/reset-password', methods=['POST'])
@jwt_required()
def reset_password(usuario_id):
    current_user_id = get_jwt_identity()

    # Solo superAdmin puede resetear contraseñas
    solicitante = Usuario.query.get(current_user_id)
    if not solicitante:
        return jsonify({"message": "No autenticado"}), 401

    if solicitante.rol != "superAdmin":
        return jsonify({"message": "No tienes permisos para resetear contraseñas"}), 403

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Resetear a contraseña temporal (username como contraseña, igual que en register)
    usuario.contrasena = generate_password_hash(usuario.username)
    usuario.set_password = True  # fuerza a cambiarla en el próximo login
    db.session.commit()

    return jsonify({"message": f"Contraseña de {usuario.username} reseteada correctamente"}), 200


