from flask import Flask
from clases import db, Nodo, app, NodoEjecucion
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta


# 1. CORS primero, antes de todo
import os

# Habilita múltiples orígenes para desarrollo (Vite) y prod (nginx/tomcat)
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost").split(",")

CORS(app, resources={r"/*": {
    "origins": origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Content-Type", "Authorization"]
}}, supports_credentials=True)

# 2. JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secreta-clave-para-mi-tfg!")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)
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


# --- HEALTH CHECK (Railway / load balancers) ---
from flask import jsonify

@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200


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
    
    app.run(host="0.0.0.0", debug=True)