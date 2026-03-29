from flask import Blueprint, request, jsonify, session
from clases import db, Paciente, Centro, CentroUsuario, Usuario

pacientes_bp = Blueprint("pacientes", __name__)

ESTADOS_VALIDOS = ["En tratamiento", "Alta médica", "Pendiente evaluación", "Baja temporal"]


def _tiene_acceso_centro(user_id: int, centro_id: int) -> bool:
    """Devuelve True si el usuario es superAdmin o tiene rol en ese centro."""
    user = Usuario.query.get(user_id)
    if not user:
        return False
    if user.rol == "superAdmin":
        return True
    return CentroUsuario.query.filter_by(
        usuario_id=user_id, centro_id=centro_id
    ).first() is not None


# ── GET /centros/<id>/pacientes ───────────────────────────────────────────────
@pacientes_bp.route("/centros/<int:centro_id>/pacientes", methods=["GET"])
def get_pacientes(centro_id):
    user_id = request.args.get("user_id") or session.get("user_id")
    if not user_id or not _tiene_acceso_centro(int(user_id), centro_id):
        return jsonify({"message": "No autorizado"}), 403

    pacientes = Paciente.query.filter_by(centro_id=centro_id).all()
    return jsonify([p.to_dict() for p in pacientes]), 200


# ── POST /centros/<id>/pacientes ──────────────────────────────────────────────
@pacientes_bp.route("/centros/<int:centro_id>/pacientes", methods=["POST"])
def crear_paciente(centro_id):
    user_id = session.get("user_id") or request.json.get("user_id")
    if not user_id or not _tiene_acceso_centro(int(user_id), centro_id):
        return jsonify({"message": "No autorizado"}), 403

    data = request.get_json()
    campos = ["nombre", "apellidos", "dni", "edad"]
    faltantes = [c for c in campos if not data.get(c)]
    if faltantes:
        return jsonify({"message": f"Faltan campos: {', '.join(faltantes)}"}), 400

    if data.get("estado") and data["estado"] not in ESTADOS_VALIDOS:
        return jsonify({"message": "Estado no válido"}), 400

    from datetime import date
    fecha = None
    if data.get("fecha_ingreso"):
        try:
            fecha = date.fromisoformat(data["fecha_ingreso"])
        except ValueError:
            return jsonify({"message": "Formato de fecha incorrecto (YYYY-MM-DD)"}), 400

    try:
        paciente = Paciente(
            nombre=data["nombre"],
            apellidos=data["apellidos"],
            dni=data["dni"],
            edad=int(data["edad"]),
            contacto=data.get("contacto"),
            historial_medico=data.get("historial_medico"),
            estado=data.get("estado", "En tratamiento"),
            fecha_ingreso=fecha,
            centro_id=centro_id,
        )
        db.session.add(paciente)
        db.session.commit()
        return jsonify({"message": "Paciente creado", "paciente": paciente.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error interno: {e}"}), 500


# ── PUT /pacientes/<id> ───────────────────────────────────────────────────────
@pacientes_bp.route("/pacientes/<int:paciente_id>", methods=["PUT"])
def editar_paciente(paciente_id):
    user_id = session.get("user_id") or request.json.get("user_id")
    paciente = Paciente.query.get_or_404(paciente_id)

    if not user_id or not _tiene_acceso_centro(int(user_id), paciente.centro_id):
        return jsonify({"message": "No autorizado"}), 403

    data = request.get_json()

    if data.get("estado") and data["estado"] not in ESTADOS_VALIDOS:
        return jsonify({"message": "Estado no válido"}), 400

    from datetime import date
    try:
        paciente.nombre           = data.get("nombre",           paciente.nombre)
        paciente.apellidos        = data.get("apellidos",        paciente.apellidos)
        paciente.dni              = data.get("dni",              paciente.dni)
        paciente.edad             = int(data["edad"])            if "edad"  in data else paciente.edad
        paciente.contacto         = data.get("contacto",         paciente.contacto)
        paciente.historial_medico = data.get("historial_medico", paciente.historial_medico)
        paciente.estado           = data.get("estado",           paciente.estado)

        if "fecha_ingreso" in data and data["fecha_ingreso"]:
            paciente.fecha_ingreso = date.fromisoformat(data["fecha_ingreso"])

        db.session.commit()
        return jsonify({"message": "Paciente actualizado", "paciente": paciente.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error interno: {e}"}), 500


# ── DELETE /pacientes/<id> ────────────────────────────────────────────────────
@pacientes_bp.route("/pacientes/<int:paciente_id>", methods=["DELETE"])
def eliminar_paciente(paciente_id):
    user_id = session.get("user_id") or request.args.get("user_id")
    paciente = Paciente.query.get_or_404(paciente_id)

    if not user_id or not _tiene_acceso_centro(int(user_id), paciente.centro_id):
        return jsonify({"message": "No autorizado"}), 403

    try:
        db.session.delete(paciente)
        db.session.commit()
        return jsonify({"message": "Paciente eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error interno: {e}"}), 500