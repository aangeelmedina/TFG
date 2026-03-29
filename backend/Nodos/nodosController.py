from flask import Blueprint, jsonify, request
from clases import db, Paciente, ArbolDecision, Nodo

nodos_bp = Blueprint("nodos", __name__, url_prefix="/api")


# ══════════════════════════════════════════════
#  ÁRBOLES DE UN PACIENTE
# ══════════════════════════════════════════════

@nodos_bp.route("/pacientes/<int:paciente_id>/arboles", methods=["GET"])
def get_arboles(paciente_id: int):
    """
    Lista todos los árboles de decisión de un paciente.

    Response 200:
        [ { id, titulo, paciente_id, creado_en, num_nodos }, ... ]
    Response 404:
        { "error": "Paciente no encontrado" }
    """
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404

    arboles = [a.to_dict() for a in paciente.arboles]
    return jsonify(arboles), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles", methods=["POST"])
def crear_arbol(paciente_id: int):
    """
    Crea un árbol nuevo para el paciente con un nodo raíz vacío.

    Body JSON (opcional):
        { "titulo": "Nombre del árbol" }

    Response 201:
        { id, titulo, paciente_id, creado_en, num_nodos, raiz: {...} }
    Response 404:
        { "error": "Paciente no encontrado" }
    """
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404

    body   = request.get_json(silent=True) or {}
    titulo = (body.get("titulo") or "").strip() or "Árbol sin título"

    # Crear árbol
    arbol = ArbolDecision(titulo=titulo, paciente_id=paciente_id)
    db.session.add(arbol)
    db.session.flush()  # obtener arbol.id antes del commit

    # Crear nodo raíz automáticamente
    raiz = Nodo(texto="Inicio", es_final=False, arbol_id=arbol.id)
    db.session.add(raiz)
    db.session.commit()

    return jsonify(arbol.to_dict(include_tree=True)), 201


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>", methods=["GET"])
def get_arbol(paciente_id: int, arbol_id: int):
    """
    Devuelve un árbol completo con todos sus nodos anidados.

    Response 200:
        { id, titulo, paciente_id, creado_en, num_nodos, raiz: { ...recursivo... } }
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol
    return jsonify(arbol.to_dict(include_tree=True)), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>", methods=["PATCH"])
def editar_arbol(paciente_id: int, arbol_id: int):
    """
    Edita el título de un árbol.

    Body JSON:
        { "titulo": "Nuevo título" }
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    body   = request.get_json(silent=True) or {}
    titulo = (body.get("titulo") or "").strip()
    if not titulo:
        return jsonify({"error": "El título no puede estar vacío"}), 400

    arbol.titulo = titulo
    db.session.commit()
    return jsonify(arbol.to_dict()), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>", methods=["DELETE"])
def eliminar_arbol(paciente_id: int, arbol_id: int):
    """
    Elimina un árbol completo y todos sus nodos (cascade).

    Response 200:
        { "eliminado": arbol_id }
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    db.session.delete(arbol)
    db.session.commit()
    return jsonify({"eliminado": arbol_id}), 200


# ══════════════════════════════════════════════
#  NODOS DENTRO DE UN ÁRBOL
# ══════════════════════════════════════════════

@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>/nodos", methods=["POST"])
def crear_nodo(paciente_id: int, arbol_id: int):
    """
    Crea un nodo hijo bajo un nodo padre del árbol.

    Body JSON:
        { "padre_id": 5, "texto": "...", "es_final": false }

    Response 201:
        Nodo creado serializado (sin hijos)
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    body     = request.get_json(silent=True) or {}
    padre_id = body.get("padre_id")
    texto    = (body.get("texto") or "").strip()
    es_final = bool(body.get("es_final", False))

    if not texto:
        return jsonify({"error": "El campo 'texto' es obligatorio"}), 400
    if padre_id is None:
        return jsonify({"error": "El campo 'padre_id' es obligatorio"}), 400

    padre = Nodo.query.get(padre_id)
    if not padre or padre.arbol_id != arbol_id:
        return jsonify({"error": "Nodo padre no encontrado en este árbol"}), 404
    if not padre.puede_tener_hijos():
        return jsonify({"error": "El nodo padre ya tiene el máximo de hijos permitido (2)"}), 400

    nuevo = Nodo(texto=texto, es_final=es_final, padre_id=padre_id, arbol_id=arbol_id)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict(recurse=False)), 201


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>/nodos/<int:nodo_id>", methods=["PATCH"])
def editar_nodo(paciente_id: int, arbol_id: int, nodo_id: int):
    """
    Edita texto y/o es_final de un nodo.

    Body JSON (campos opcionales):
        { "texto": "...", "es_final": true }
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    nodo = _get_nodo_o_404(nodo_id, arbol_id)
    if isinstance(nodo, tuple):
        return nodo

    body = request.get_json(silent=True) or {}

    if "texto" in body:
        texto = body["texto"].strip()
        if not texto:
            return jsonify({"error": "El texto no puede estar vacío"}), 400
        nodo.texto = texto

    if "es_final" in body:
        nodo.es_final = bool(body["es_final"])

    db.session.commit()
    return jsonify(nodo.to_dict(recurse=False)), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>/nodos/<int:nodo_id>", methods=["DELETE"])
def eliminar_nodo(paciente_id: int, arbol_id: int, nodo_id: int):
    """
    Elimina un nodo y todos sus descendientes (cascade).
    No permite eliminar el nodo raíz — usa eliminar_arbol para eso.

    Response 200: { "eliminado": nodo_id }
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    nodo = _get_nodo_o_404(nodo_id, arbol_id)
    if isinstance(nodo, tuple):
        return nodo

    if nodo.padre_id is None:
        return jsonify({
            "error": "No se puede eliminar el nodo raíz. Elimina el árbol completo."
        }), 400

    db.session.delete(nodo)
    db.session.commit()
    return jsonify({"eliminado": nodo_id}), 200


# ══════════════════════════════════════════════
#  HELPERS INTERNOS
# ══════════════════════════════════════════════

def _get_arbol_o_404(paciente_id: int, arbol_id: int):
    """Devuelve el ArbolDecision si pertenece al paciente, o tupla de error."""
    arbol = ArbolDecision.query.get(arbol_id)
    if not arbol:
        return jsonify({"error": "Árbol no encontrado"}), 404
    if arbol.paciente_id != paciente_id:
        return jsonify({"error": "Este árbol no pertenece al paciente indicado"}), 403
    return arbol


def _get_nodo_o_404(nodo_id: int, arbol_id: int):
    """Devuelve el Nodo si pertenece al árbol, o tupla de error."""
    nodo = Nodo.query.get(nodo_id)
    if not nodo or nodo.arbol_id != arbol_id:
        return jsonify({"error": "Nodo no encontrado en este árbol"}), 404
    return nodo