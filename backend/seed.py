"""
seed.py - Se ejecuta UNA VEZ al arrancar el contenedor backend.
Crea el usuario admin si no existe, con contraseña 'admin' hasheada correctamente.
"""
from clases import app, db, Usuario
from werkzeug.security import generate_password_hash

def seed():
    with app.app_context():
        db.create_all()
        if not Usuario.query.filter_by(username='admin').first():
            admin = Usuario(
                username='admin',
                contrasena=generate_password_hash('admin'),
                rol='superAdmin',
                set_password=False,  # No es temporal, es la contraseña real
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Usuario admin creado (admin/admin)")
        else:
            print("ℹ️  Usuario admin ya existe, se omite.")

if __name__ == '__main__':
    seed()