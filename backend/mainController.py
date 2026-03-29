from flask import Flask
from clases import db, Nodo, app
from flask_cors import CORS
from flask_jwt_extended import JWTManager


# 1. CORS primero, antes de todo
CORS(app, resources={r"/*": {
    "origins": "http://localhost:5173",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}}, supports_credentials=True)

# 2. JWT
app.config["JWT_SECRET_KEY"] = "super-secreta-clave-para-mi-tfg!"  # 32 bytes
jwt = JWTManager(app)

# 3. Blueprints al final
from Usuarios.loginController import usuarios_bp
from Centros.centrosController import centros_bp
from Pacientes.pacientesController import pacientes_bp

app.register_blueprint(usuarios_bp, url_prefix='/auth')
app.register_blueprint(centros_bp)
app.register_blueprint(pacientes_bp)

from flask import request, make_response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200


@app.route('/')
def index():
    # Necesitamos pasar el nodo raíz a la plantilla para empezar a dibujar
    nodo_raiz = Nodo.query.filter_by(padre_id=None).first()
    return render_template('index.html', raiz=nodo_raiz)

# Ruta para que el ADMINISTRADOR cree nodos
@app.route('/crear_nodo/<int:padre_id>', methods=['POST'])
def crear_nodo_hijo(padre_id):
    padre = Nodo.query.get_or_404(padre_id)
    
    # 1. LOGICA DE NEGOCIO: Validación (por seguridad)
    if not padre.puede_tener_hijos():
        # En un caso real, aquí mostrarías un mensaje de error 'flash'
        return "ERROR: Intentaste añadir un tercer hijo. Acción bloqueada."
    
    # 2. Recibir datos del formulario modal
    texto_nuevo = request.form.get('texto')
    # El checkbox si no está marcado envía None, si está marcado envía 'on'
    es_final = True if request.form.get('es_final') == 'on' else False
    
    # 3. Crear y guardar
    nuevo_nodo = Nodo(texto=texto_nuevo, padre=padre, es_final=es_final)
    db.session.add(nuevo_nodo)
    db.session.commit()
    
    # REDIRECCIÓN: Volver al índice para ver el árbol actualizado
    return redirect(url_for('index'))

# --- INICIALIZACIÓN ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # --- BLOQUE DE PRUEBA AUTOMÁTICA ---
        # Si no hay nodo raíz, creamos uno automáticamente para que puedas probar
        if not Nodo.query.filter_by(padre_id=None).first():
            raiz = Nodo(texto="INICIO - ¿Qué quieres hacer?", padre=None)
            db.session.add(raiz)
            db.session.commit()
            print("--> ¡Nodo RAÍZ creado automáticamente!")
            
        print("¡Base de datos lista!")
    
    app.run(debug=True)