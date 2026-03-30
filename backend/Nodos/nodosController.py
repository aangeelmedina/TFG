from flask import Blueprint, jsonify, request
from clases import db, Paciente, ArbolDecision, Nodo

nodos_bp = Blueprint("nodos", __name__, url_prefix="/api")


# ══════════════════════════════════════════════
#  ÁRBOLES DE UN PACIENTE
# ══════════════════════════════════════════════

@nodos_bp.route("/pacientes/<int:paciente_id>/arboles", methods=["GET"])
def get_arboles(paciente_id: int):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
    arboles = [a.to_dict() for a in paciente.arboles]
    return jsonify(arboles), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles", methods=["POST"])
def crear_arbol(paciente_id: int):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404

    body   = request.get_json(silent=True) or {}
    titulo = (body.get("titulo") or "").strip() or "Árbol sin título"

    arbol = ArbolDecision(titulo=titulo, paciente_id=paciente_id)
    db.session.add(arbol)
    db.session.flush()

    raiz = Nodo(texto="Inicio", es_final=False, arbol_id=arbol.id)
    db.session.add(raiz)
    db.session.commit()

    return jsonify(arbol.to_dict(include_tree=True)), 201


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>", methods=["GET"])
def get_arbol(paciente_id: int, arbol_id: int):
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol
    return jsonify(arbol.to_dict(include_tree=True)), 200


@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>", methods=["PATCH"])
def editar_arbol(paciente_id: int, arbol_id: int):
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
#  JUGAR AL ÁRBOL  —  GET /pacientes/:pid/arboles/:aid/jugar
# ══════════════════════════════════════════════

@nodos_bp.route("/pacientes/<int:paciente_id>/arboles/<int:arbol_id>/jugar", methods=["GET"])
def jugar_arbol(paciente_id: int, arbol_id: int):
    """
    Devuelve el nodo actual para jugar.

    Query params:
        nodo_id (opcional) — si se omite, devuelve la raíz

    Response 200:
    {
        "id":       int,
        "texto":    str,
        "es_final": bool,
        "nivel":    int,           # profundidad desde la raíz (0 = raíz)
        "num_hijos": int,          # 0, 1 ó 2
        "hijos": [
            { "id": int, "texto": str, "es_final": bool },
            ...
        ]
    }

    Instrucciones de navegación para el frontend:
      - 1 hijo  → click simple avanza al único hijo
      - 2 hijos → click simple = hijos[0], doble click = hijos[1]
      - 0 hijos (es_final) → nodo final, mostrar mensaje de fin
    """
    arbol = _get_arbol_o_404(paciente_id, arbol_id)
    if isinstance(arbol, tuple):
        return arbol

    nodo_id = request.args.get("nodo_id", type=int)

    if nodo_id is None:
        # Empezar por la raíz
        nodo = Nodo.query.filter_by(arbol_id=arbol_id, padre_id=None).first()
        if not nodo:
            return jsonify({"error": "El árbol no tiene nodo raíz"}), 404
    else:
        nodo = _get_nodo_o_404(nodo_id, arbol_id)
        if isinstance(nodo, tuple):
            return nodo

    # Calcular nivel (profundidad desde raíz)
    nivel   = 0
    cursor  = nodo
    while cursor.padre_id is not None:
        cursor = Nodo.query.get(cursor.padre_id)
        nivel += 1

    hijos = Nodo.query.filter_by(padre_id=nodo.id).all()

    return jsonify({
        "id":        nodo.id,
        "texto":     nodo.texto,
        "es_final":  nodo.es_final,
        "nivel":     nivel,
        "num_hijos": len(hijos),
        "hijos": [
            {"id": h.id, "texto": h.texto, "es_final": h.es_final}
            for h in hijos
        ],
    }), 200


# ══════════════════════════════════════════════
#  HELPERS INTERNOS
# ══════════════════════════════════════════════

def _get_arbol_o_404(paciente_id: int, arbol_id: int):
    arbol = ArbolDecision.query.get(arbol_id)
    if not arbol:
        return jsonify({"error": "Árbol no encontrado"}), 404
    if arbol.paciente_id != paciente_id:
        return jsonify({"error": "Este árbol no pertenece al paciente indicado"}), 403
    return arbol


def _get_nodo_o_404(nodo_id: int, arbol_id: int):
    nodo = Nodo.query.get(nodo_id)
    if not nodo or nodo.arbol_id != arbol_id:
        return jsonify({"error": "Nodo no encontrado en este árbol"}), 404
    return nodo