from flask import Flask
from clases import db, Nodo, app
from flask_cors import CORS
from flask_jwt_extended import JWTManager


# 1. CORS primero, antes de todo
CORS(app, resources={r"/*": {
    "origins": "http://localhost:5173",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Content-Type", "Authorization"]
}}, supports_credentials=True)

# 2. JWT
app.config["JWT_SECRET_KEY"] = "super-secreta-clave-para-mi-tfg!"  # 32 bytes
jwt = JWTManager(app)

# 3. Blueprints al final
from Usuarios.loginController import usuarios_bp
from Centros.centrosController import centros_bp
from Pacientes.pacientesController import pacientes_bp
from Nodos.nodosController import nodos_bp

app.register_blueprint(usuarios_bp, url_prefix='/auth')
app.register_blueprint(centros_bp)
app.register_blueprint(pacientes_bp)
app.register_blueprint(nodos_bp)

from flask import request, make_response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200




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