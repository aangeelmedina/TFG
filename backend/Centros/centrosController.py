from flask import Blueprint, request, jsonify, session
from flask_jwt_extended import jwt_required, get_jwt_identity
from clases import db, Centro, Usuario, CentroUsuario, Paciente  # asegúrate de que Centro esté importado

centros_bp = Blueprint("centros", __name__)

@centros_bp.route("/centros", methods=["GET"])
def get_centros():
    user_id = request.args.get('user_id') or session.get("user_id")

    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Si es superAdmin devuelve todos los centros
    if user.rol == "superAdmin":
        centros = Centro.query.all()
    else:
        # Busca en la tabla centro_usuarios los centros asignados al usuario
        asignaciones = CentroUsuario.query.filter_by(usuario_id=user.id).all()
        centro_ids = [a.centro_id for a in asignaciones]
        centros = Centro.query.filter(Centro.id.in_(centro_ids)).all()

    centros_json = [
        {
            "id": c.id,
            "nombre": c.nombre,
            "direccion": c.direccion,
            "telefono": c.telefono,
            "email": c.email,
        } for c in centros
    ]

    return jsonify(centros_json), 200

@centros_bp.route("/centros/añadir", methods=["POST"])
def add_centro():
    # 1. Obtener los datos JSON
    data = request.get_json()

    if not data:
        return jsonify({"message": "No se enviaron datos"}), 400

    # 2. Seguridad: Verificar si el usuario tiene permiso (superAdmin)
    # Buscamos en sesión primero, o en el body si lo estás enviando manualmente
    user_id = data['user']
    
    if not user_id:
        return jsonify({"message": "Usuario no identificado"}), 401

    user = Usuario.query.get(user_id)
    
    # Validamos que el usuario exista y sea superAdmin
    if not user or user.rol != "superAdmin":
        return jsonify({"message": "No tienes permisos para crear un centro"}), 403

    # 3. Validar campos obligatorios
    campos_requeridos = ["nombre", "direccion", "telefono", "email"]
    missing_fields = [campo for campo in campos_requeridos if campo not in data or not data[campo]]
    
    if missing_fields:
        return jsonify({"message": f"Faltan campos obligatorios: {', '.join(missing_fields)}"}), 400

    try:
        # 4. Crear el objeto Centro
        nuevo_centro = Centro(
            nombre=data["nombre"],
            direccion=data["direccion"],
            telefono=data["telefono"],
            email=data["email"],
        )

        # 5. Guardar en Base de Datos
        db.session.add(nuevo_centro)
        db.session.commit()

        # 6. Retornar respuesta exitosa
        return jsonify({
            "message": "Centro creado correctamente",
            "centro": {
                "id": nuevo_centro.id,
                "nombre": nuevo_centro.nombre,
                "direccion": nuevo_centro.direccion,
                "telefono": nuevo_centro.telefono,
                "email": nuevo_centro.email,
            }
        }), 201

    except Exception as e:
        db.session.rollback()  # Revertir cambios si hay error
        print(f"Error al crear centro: {e}")
        return jsonify({"message": "Error interno del servidor al guardar el centro"}), 500


@centros_bp.route("/usuarios", methods=["GET"])
def get_usuarios():
    usuarios = Usuario.query.filter(
        (Usuario.rol != "superAdmin") | (Usuario.rol == None)
    ).all()
    return jsonify([
        {"id": u.id, "username": u.username, "rol": u.rol}
        for u in usuarios
    ]), 200

@centros_bp.route("/centros/<int:centro_id>/usuarios", methods=["GET"])
def get_usuarios_centro(centro_id):
    asignaciones = CentroUsuario.query.filter_by(centro_id=centro_id).all()
    return jsonify([
        {
            "id": a.id,
            "usuario_id": a.usuario_id,
            "username": a.usuario.username,
            "rol": a.rol,
            "activo": a.activo
        }
        for a in asignaciones
    ]), 200

@centros_bp.route("/centros/<int:centro_id>/asignar-usuario", methods=["POST"])
def asignar_usuario(centro_id):
    data = request.get_json()
    usuario_id = data.get("usuario_id")
    rol = data.get("rol")
    user_id = data.get("user_id") or session.get("user_id")

    # Verificar permisos: debe ser superAdmin o tener rol admin en este centro
    solicitante = Usuario.query.get(user_id)
    if not solicitante:
        return jsonify({"message": "No autenticado"}), 401

    if solicitante.rol != "superAdmin":
        permiso = CentroUsuario.query.filter_by(
            centro_id=centro_id,
            usuario_id=user_id,
            rol="admin"
        ).first()
        if not permiso:
            return jsonify({"message": "No tienes permisos para añadir usuarios a este centro"}), 403

    if rol == "superAdmin":
        return jsonify({"message": "No se puede asignar el rol superAdmin"}), 403

    centro = Centro.query.get(centro_id)
    usuario = Usuario.query.get(usuario_id)

    if not centro or not usuario:
        return jsonify({"message": "Centro o usuario no encontrado"}), 404

    if usuario.rol == "superAdmin":
        return jsonify({"message": "No se puede asignar un superAdmin a un centro"}), 403

    asignacion = CentroUsuario.query.filter_by(
        centro_id=centro_id, usuario_id=usuario_id
    ).first()

    if asignacion:
        asignacion.rol = rol
        asignacion.activo = True
    else:
        asignacion = CentroUsuario(centro_id=centro_id, usuario_id=usuario_id, rol=rol, activo=True)
        db.session.add(asignacion)

    db.session.commit()
    return jsonify({"message": f"Usuario asignado como {rol} correctamente"}), 200

@centros_bp.route("/centros/<int:centro_id>/asignar-usuario/<int:usuario_id>", methods=["DELETE"])
def eliminar_usuario_centro(centro_id, usuario_id):
    asignacion = CentroUsuario.query.filter_by(
        centro_id=centro_id, usuario_id=usuario_id
    ).first()

    if not asignacion:
        return jsonify({"message": "Asignación no encontrada"}), 404

    db.session.delete(asignacion)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado del centro"}), 200


@centros_bp.route("/centros/<int:centro_id>/usuarios/<int:usuario_id>/estado", methods=["PATCH"])
@jwt_required()
def toggle_estado_usuario_centro(centro_id, usuario_id):
    solicitante_id = get_jwt_identity()
    solicitante = Usuario.query.get(solicitante_id)
    if not solicitante:
        return jsonify({"message": "No autenticado"}), 401

    # Solo superAdmin o admin del centro pueden cambiar el estado
    if solicitante.rol != "superAdmin":
        permiso = CentroUsuario.query.filter_by(
            centro_id=centro_id, usuario_id=solicitante_id, rol="admin"
        ).first()
        if not permiso:
            return jsonify({"message": "No tienes permisos"}), 403

    asignacion = CentroUsuario.query.filter_by(
        centro_id=centro_id, usuario_id=usuario_id
    ).first()
    if not asignacion:
        return jsonify({"message": "Asignación no encontrada"}), 404

    asignacion.activo = not asignacion.activo
    db.session.commit()
    estado = "activo" if asignacion.activo else "inactivo"
    return jsonify({"message": f"Usuario marcado como {estado}", "activo": asignacion.activo}), 200


@centros_bp.route("/centro/<int:centro_id>", methods=["DELETE"])
@jwt_required()
def eliminar_centro(centro_id):
    user_id = get_jwt_identity()

    solicitante = Usuario.query.get(user_id)
    if not solicitante:
        return jsonify({"message": "No autenticado"}), 401

    if solicitante.rol != "superAdmin":
        return jsonify({"message": "No tienes permisos para eliminar un centro"}), 403

    centro = Centro.query.get(centro_id)
    if not centro:
        return jsonify({"message": "Centro no encontrado"}), 404

    try:
        # Eliminar asignaciones de usuarios al centro
        CentroUsuario.query.filter_by(centro_id=centro_id).delete()

        # Eliminar pacientes (sus árboles y nodos se borran en cascada)
        for paciente in list(centro.pacientes):
            db.session.delete(paciente)

        db.session.delete(centro)
        db.session.commit()
        return jsonify({"message": "Centro eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar centro: {e}")
        return jsonify({"message": "Error interno al eliminar el centro"}), 500